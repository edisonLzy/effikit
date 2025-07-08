
import { useState, useCallback } from 'react';

interface ClipboardItem {
  type: string;
  data: string;
  kind: 'string' | 'file';
}

export function useClipboardViewer() {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    event.preventDefault();
    setError(null);
    setClipboardItems([]);

    const items = event.clipboardData.items;
    const collectedItems: ClipboardItem[] = [];

    const promises = Array.from(items).map(item => {
      return new Promise<void>(resolve => {
        const mimeType = item.type;
        if (item.kind === 'string') {
          item.getAsString(data => {
            // When pasting plain text, the type can be an empty string. Default it to 'text/plain'.
            collectedItems.push({ type: mimeType, data, kind: 'string' });
            resolve();
          });
        } else if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            collectedItems.push({
              type: item.type,
              data: `Name: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}`,
              kind: 'file',
            });
          }
          resolve();
        } else {
          resolve();
        }
      });
    });

    try {
      await Promise.all(promises);
      // Sort to bring non-text/plain types first.
      collectedItems.sort((a, b) => {
        if (a.type === 'text/plain' && b.type !== 'text/plain') {
          return 1; // a comes after b
        }
        if (a.type !== 'text/plain' && b.type === 'text/plain') {
          return -1; // a comes before b
        }
        return 0; // maintain original order for other types
      });
      setClipboardItems(collectedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Failed to read clipboard contents:', err);
      setError(`Failed to read clipboard contents: ${errorMessage}`);
    }
  }, []);

  return { clipboardItems, error, handlePaste };
}
