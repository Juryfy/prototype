// Pre-computed AI analysis results for the Analyser page (Req 5)

export interface CaseSummary {
  legalIssue: string;
  keyPoints: string[];
  successProbability: number;
}

export interface RelevantCaseLaw {
  citation: string;
  court: string;
  practiceArea: string;
  citedTimes: number;
  description: string;
  outcome: 'Favorable' | 'Neutral' | 'Unfavorable';
}

export interface StatutoryProvision {
  section: string;
  act: string;
  text: string;
  relevance: 'Primary' | 'Supporting';
}

export interface ApplicableSection {
  section: string;
  description: string;
  relevance: 'High relevance' | 'Medium relevance';
}

export interface RequiredDocument {
  id: string;
  description: string;
  checked: boolean;
}

export interface SimilarCase {
  citation: string;
  outcome: string;
  badge: 'WIN' | 'LOSS' | 'Partial';
}

export interface OutcomePrediction {
  winningPct: number;
  losingPct: number;
}

export interface StrengthItem {
  title: string;
  description: string;
}

export interface ChallengeItem {
  title: string;
  description: string;
}

export interface StrategyStep {
  step: number;
  title: string;
  description: string;
}

export interface AnalysisResult {
  caseSummary: CaseSummary;
  relevantCaseLaws: RelevantCaseLaw[];
  statutoryProvisions: StatutoryProvision[];
  caseTypes: string[];
  jurisdiction: string;
  applicableSections: ApplicableSection[];
  requiredDocuments: RequiredDocument[];
  similarCases: SimilarCase[];
  outcomePrediction: OutcomePrediction;
  keyWinningPoints: string[];
  riskFactors: string[];
  strengths: StrengthItem[];
  challenges: ChallengeItem[];
  strategy: StrategyStep[];
  expertRecommendation: string;
}

// ─── Pre-computed analysis result (Req 5) ───

export const mockAnalysisResult: AnalysisResult = {
  caseSummary: {
    legalIssue:
      'The case involves a property dispute under Section 9 of the Specific Relief Act, 1963. The plaintiff seeks specific performance of a contract for sale of immovable property.',
    keyPoints: [
      'Strong precedent in favor of specific performance',
      'Recent Supreme Court judgment supports the claim',
      'Time limitation issues need careful consideration',
    ],
    successProbability: 75,
  },

  relevantCaseLaws: [
    {
      citation: 'Saralamani Kandappan v. S. Rajalakshmi (2011) 12 SCC 18',
      court: 'Supreme Court',
      practiceArea: 'Specific Relief',
      citedTimes: 127,
      description:
        'Landmark judgment on specific performance of contracts relating to immovable property. Established that readiness and willingness must be pleaded and proved.',
      outcome: 'Favorable',
    },
    {
      citation: 'Nirmala Anand v. Advent Corporation (2002) 8 SCC 146',
      court: 'Supreme Court',
      practiceArea: 'Contract Law',
      citedTimes: 89,
      description:
        'Established principles for granting specific performance when the plaintiff has performed substantial part of the contract.',
      outcome: 'Favorable',
    },
    {
      citation: 'K.S. Vidyanadam v. Vairavan (1997) 3 SCC 1',
      court: 'Supreme Court',
      practiceArea: 'Property Law',
      citedTimes: 156,
      description:
        'Principles regarding partial performance and possession of property under sale agreement. Time is not of essence in property contracts.',
      outcome: 'Neutral',
    },
  ],

  statutoryProvisions: [
    {
      section: 'Section 9',
      act: 'Specific Relief Act, 1963',
      text: 'Except as otherwise provided in this Chapter, specific performance of a contract may, in the discretion of the court, be enforced...',
      relevance: 'Primary',
    },
    {
      section: 'Section 16',
      act: 'Specific Relief Act, 1963',
      text: 'Personal bars to relief: Specific performance of a contract cannot be enforced in favour of a person who would not be entitled to recover compensation...',
      relevance: 'Supporting',
    },
    {
      section: 'Section 20',
      act: 'Specific Relief Act, 1963',
      text: 'Power to award compensation in certain cases: The jurisdiction to decree specific performance is discretionary...',
      relevance: 'Supporting',
    },
  ],

  caseTypes: ['Criminal', 'Financial Fraud'],
  jurisdiction: 'India - BNS/IPC',

  applicableSections: [
    { section: 'Section 420 IPC', description: 'Cheating and dishonesty inducing delivery of property', relevance: 'High relevance' },
    { section: 'Criminal 406 IPC', description: 'Criminal breach of trust', relevance: 'Medium relevance' },
    { section: 'IT Act Section 660', description: 'Online fraud by impersonation', relevance: 'Medium relevance' },
  ],

  requiredDocuments: [
    { id: 'doc-1', description: 'Contracts and agreements are involved', checked: false },
    { id: 'doc-2', description: 'Correspondence with the opposing party', checked: false },
    { id: 'doc-3', description: 'Bank statements showing fraudulent transactions', checked: false },
  ],

  similarCases: [
    { citation: 'Sharma vs State (2001)', outcome: 'Outcome: Conviction', badge: 'WIN' },
    { citation: 'Smith vs John (2010)', outcome: 'Outcome: Acquittal', badge: 'LOSS' },
    { citation: 'Raj vs Ramesh (2018)', outcome: 'Outcome: Settlement', badge: 'Partial' },
  ],

  outcomePrediction: {
    winningPct: 70,
    losingPct: 30,
  },

  keyWinningPoints: [
    'Strong evidence of infringement',
    'Prior similar cases with favorable rulings',
    'Clear intent established',
  ],

  riskFactors: [
    'Clear construction challenges',
    'Expert witness credibility',
    'Social Media Missteps',
  ],

  strengths: [
    {
      title: 'Strong Documentary Evidence',
      description: 'Sale agreement, receipts, and possession documents available',
    },
    {
      title: 'Readiness & Willingness Proven',
      description: 'Plaintiff has demonstrated continuous readiness to perform',
    },
    {
      title: 'Favorable Recent Precedents',
      description: 'Supreme Court rulings support similar claims',
    },
    {
      title: 'Part Performance',
      description: 'Substantial payment made and possession transferred',
    },
  ],

  challenges: [
    {
      title: 'Limitation Period Concerns',
      description: 'Need to establish cause of action within 3 years',
    },
    {
      title: "Opposing Party's Counter Claims",
      description: 'Defendant may argue breach by plaintiff',
    },
    {
      title: 'Market Value Changes',
      description: "Significant appreciation may affect court's discretion",
    },
    {
      title: 'Documentation Gaps',
      description: 'Some supporting documents may need strengthening',
    },
  ],

  strategy: [
    {
      step: 1,
      title: 'File Suit for Specific Performance',
      description: 'Immediately file suit under Section 9 of Specific Relief Act. Strong grounds exist for decree.',
    },
    {
      step: 2,
      title: 'Strengthen Documentation',
      description: 'Gather additional evidence of readiness, payment records, and possession documents.',
    },
    {
      step: 3,
      title: 'Address Limitation Issues',
      description: 'File detailed affidavit explaining timeline and cause of action within limitation period.',
    },
    {
      step: 4,
      title: 'Prepare for Alternative Relief',
      description: 'Keep compensation claim ready as alternative if specific performance denied.',
    },
  ],

  expertRecommendation:
    'Based on comprehensive analysis of 127 similar cases, the recommended approach offers 75% success probability. Consider engaging expert witnesses on property valuation and pursuing mediation alongside litigation for optimal outcomes.',
};
