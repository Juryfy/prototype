/**
 * Simple DOCX text extractor
 * DOCX files are ZIP archives containing XML.
 * This extracts text from the document.xml inside the ZIP.
 */

/**
 * Extract raw text from a DOCX ArrayBuffer
 * Uses the browser's built-in DecompressionStream for ZIP handling
 */
export async function extractRawText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // DOCX is a ZIP file. We need to find and parse word/document.xml
    const uint8 = new Uint8Array(arrayBuffer);
    
    // Find all local file headers in the ZIP
    const files = parseZipEntries(uint8);
    
    // Find document.xml (the main content file)
    const docEntry = files.find(f => 
      f.name === 'word/document.xml' || f.name.endsWith('/document.xml')
    );
    
    if (!docEntry) {
      throw new Error('Could not find document.xml in DOCX file');
    }

    // Decompress the entry
    const xmlContent = await decompressEntry(uint8, docEntry);
    
    // Parse XML and extract text
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Extract all text nodes from w:t elements
    const textElements = xmlDoc.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      't'
    );
    
    const paragraphs: string[] = [];
    let currentParagraph = '';
    
    // Also get paragraph markers to add line breaks
    const allElements = xmlDoc.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      '*'
    );
    
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i];
      if (el.localName === 'p') {
        if (currentParagraph.trim()) {
          paragraphs.push(currentParagraph.trim());
        }
        currentParagraph = '';
      } else if (el.localName === 't') {
        currentParagraph += el.textContent || '';
      }
    }
    
    // Don't forget the last paragraph
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }
    
    // If namespace-based extraction failed, try simple text extraction
    if (paragraphs.length === 0) {
      const simpleTexts: string[] = [];
      for (let i = 0; i < textElements.length; i++) {
        const text = textElements[i].textContent;
        if (text) simpleTexts.push(text);
      }
      return simpleTexts.join(' ');
    }
    
    return paragraphs.join('\n');
  } catch (error) {
    // Fallback: try to extract any readable text from the binary
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(arrayBuffer);
    // Extract text between XML tags
    const textMatches = rawText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ');
    }
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // Look for local file header signature (0x04034b50)
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
    // Stored (no compression)
    return new TextDecoder().decode(compressedData);
  }
  
  if (entry.compressionMethod === 8) {
    // Deflate compression - use DecompressionStream
    try {
      // Add raw deflate header for DecompressionStream
      const stream = new Blob([compressedData]).stream();
      const decompressedStream = stream.pipeThrough(new DecompressionStream('raw'));
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
      // Fallback: try without decompression
      return new TextDecoder('utf-8', { fatal: false }).decode(compressedData);
    }
  }
  
  throw new Error(`Unsupported compression method: ${entry.compressionMethod}`);
}
