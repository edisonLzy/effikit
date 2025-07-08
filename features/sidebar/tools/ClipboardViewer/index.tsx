
import React from 'react';
import { useClipboardViewer } from './useClipboardViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ClipboardViewer() {
  const { clipboardItems, error, handlePaste } = useClipboardViewer();

  return <div className="p-4 space-y-4 h-full overflow-y-auto" onPaste={handlePaste} tabIndex={-1}>
    <Card>
      <CardHeader>
        <CardTitle>Clipboard Viewer</CardTitle>
        <CardDescription>
          Click this area and press Ctrl/Cmd+V to see the contents of your clipboard, broken down by MIME type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground"
        >
          Paste here
        </div>
      </CardContent>
    </Card>

    {error && <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error}</p>
      </CardContent>
    </Card>
    }
    {clipboardItems.length > 0 && <Card>
      <CardHeader>
        <CardTitle>Clipboard Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clipboardItems.map((item, index) => (
          <div key={index}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{item.type || 'unknown type'}</Badge>
              <Badge variant="secondary">{item.kind}</Badge>
            </div>
            <pre
              className="p-3 bg-muted rounded-md text-sm overflow-auto whitespace-pre-wrap break-words"
            >
              {item.data || '(empty)'}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
    }
  </div>;
}
