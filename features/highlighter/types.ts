export interface Highlight {
  id: string;
  text: string;
  url: string;
  color: HighlightColor;
  timestamp: number;
  range: {
    startOffset: number;
    endOffset: number;
    startContainer: string;
    endContainer: string;
  };
}

export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green' | 'purple' | 'orange';

export interface HighlightPayload {
  text: string;
  url: string;
  color: HighlightColor;
  range: {
    startOffset: number;
    endOffset: number;
    startContainer: string;
    endContainer: string;
  };
}

export interface HighlightStorage {
  [url: string]: Highlight[];
}

export interface HighlightSettings {
  enabled: boolean;
  defaultColor: HighlightColor;
} 