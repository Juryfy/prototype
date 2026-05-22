/**
 * Simple PPTX text extractor
 * PPTX files are ZIP archives containing XML slide files.
 * Slides are in ppt/slides/slide1.xml, slide2.xml, etc.
 * Text is in <a:t> elements (drawingML namespace).
 */

/**
 * Extract text from a PPTX ArrayBuffer
 */
export async function extractPptxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8 = new Uint8Array(arrayBuffer);
    const files = parseZipEntries(uint8);

    // Find all slide XML files
    const slideEntries = files
      .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f.name))
      .sort((a, b) => {
        const numA = parseInt(a.name.match(/slide(\d+)/)?.[1] || '0');
        const numB = parseInt(b.name.match(/slide(\d+)/)?.[1] || '0');
        return numA - numB;
      });

    if (slideEntries.length === 0) {
      throw new Error('No slides found in PPTX file');
    }

    const slideTexts: string[] = [];

    for (let i = 0; i < slideEntries.length; i++) {
      const entry = slideEntries[i];
      const xmlContent = await decompressEntry(uint8, entry);

      // Parse XML and extract text from <a:t> elements
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Text in PPTX is in the drawingML namespace: <a:t>
      const textElements = xmlDoc.getElementsByTagNameNS(
        'http://schemas.openxmlformats.org/drawingml/2006/main',
        't'
      );

      const texts: string[] = [];
      for (let j = 0; j < textElements.length; j++) {
        const text = textElements[j].textContent;
        if (text && text.trim()) {
          texts.push(text.trim());
        }
      }

      if (texts.length > 0) {
        slideTexts.push(`[Slide ${i + 1}]\n${texts.join('\n')}`);
      }
    }

    return slideTexts.join('\n\n');
  } catch (error) {
    // Fallback: try regex-based extraction
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(arrayBuffer);
    const textMatches = rawText.match(/<a:t>([^<]+)<\/a:t>/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ');
    }
    throw new Error(`Failed to extract text from PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface ZipEntry {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  dataOffset: number;
}

function parseZipEntries(data: Uint8Array): ZipEntry[] {
  const entries: ZipEntry[] = [];
  let offset = 0;

  while (offset < data.length - 4) {
    if (data[offset] === 0x50 && data[offset + 1] === 0x4b &&
        data[offset + 2] === 0x03 && data[offset + 3] === 0x04) {

      const compressionMethod = data[offset + 8] | (data[offset + 9] << 8);
      const compressedSize = data[offset + 18] | (data[offset + 19] << 8) |
                            (data[offset + 20] << 16) | (data[offset + 21] << 24);
      const uncompressedSize = data[offset + 22] | (data[offset + 23] << 8) |
                              (data[offset + 24] << 16) | (data[offset + 25] << 24);
      const fileNameLength = data[offset + 26] | (data[offset + 27] << 8);
      const extraFieldLength = data[offset + 28] | (data[offset + 29] << 8);

      const fileName = new TextDecoder().decode(data.slice(offset + 30, offset + 30 + fileNameLength));
      const dataOffset = offset + 30 + fileNameLength + extraFieldLength;

      entries.push({
        name: fileName,
        compressedSize,
        uncompressedSize,
        compressionMethod,
        dataOffset,
      });

      offset = dataOffset + compressedSize;
    } else {
      offset++;
    }
  }

  return entries;
}

async function decompressEntry(data: Uint8Array, entry: ZipEntry): Promise<string> {
  const compressedData = data.slice(entry.dataOffset, entry.dataOffset + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return new TextDecoder().decode(compressedData);
  }

  if (entry.compressionMethod === 8) {
    try {
      const stream = new Blob([compressedData]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate-raw'));
      const reader = decompressedStream.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let pos = 0;
      for (const chunk of chunks) {
        result.set(chunk, pos);
        pos += chunk.length;
      }

      return new TextDecoder().decode(result);
    } catch {
      return new TextDecoder('utf-8', { fatal: false }).decode(compressedData);
    }
  }

  throw new Error(`Unsupported compression method: ${entry.compressionMethod}`);
}
