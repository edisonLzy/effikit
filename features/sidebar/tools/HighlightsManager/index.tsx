import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Highlighter, ExternalLink, Trash2, Copy } from 'lucide-react';
import { useHighlights } from './useHighlights';
import type { Highlight } from '@/features/highlighter';
import { getHighlightColorName } from '@/features/highlighter';

export function HighlightsManager() {
  const { 
    highlightsByUrl, 
    isLoading, 
    error, 
    removeHighlight, 
    clearHighlights,
    copyHighlight,
    openUrl 
  } = useHighlights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-red-500">加载失败: {error}</div>
      </div>
    );
  }

  const totalHighlights = Object.values(highlightsByUrl).reduce(
    (sum, highlights) => sum + highlights.length, 
    0
  );

  if (totalHighlights === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Highlighter className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无高亮</h3>
        <p className="text-sm text-gray-500">
          在网页上选择文本并高亮，这里就会显示你的高亮内容
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">高亮管理</h2>
        <Badge variant="secondary">
          {totalHighlights} 个高亮
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(highlightsByUrl).map(([url, highlights]) => (
          <UrlHighlightsCard
            key={url}
            url={url}
            highlights={highlights}
            onRemoveHighlight={removeHighlight}
            onClearHighlights={clearHighlights}
            onCopyHighlight={copyHighlight}
            onOpenUrl={openUrl}
          />
        ))}
      </div>
    </div>
  );
}

interface UrlHighlightsCardProps {
  url: string;
  highlights: Highlight[];
  onRemoveHighlight: (highlightId: string, url: string) => void;
  onClearHighlights: (url: string) => void;
  onCopyHighlight: (highlight: Highlight) => void;
  onOpenUrl: (url: string) => void;
}

function UrlHighlightsCard(props: UrlHighlightsCardProps) {
  const { 
    url, 
    highlights, 
    onRemoveHighlight, 
    onClearHighlights, 
    onCopyHighlight, 
    onOpenUrl 
  } = props;

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getColorBadgeClass = (color: string) => {
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              {getDomainFromUrl(url)}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {highlights.length} 个
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenUrl(url)}
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onClearHighlights(url)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {highlights.map(highlight => (
            <div
              key={highlight.id}
              className="flex items-start gap-2 p-2 rounded-md border bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getColorBadgeClass(highlight.color)}`}
                  >
                    {getHighlightColorName(highlight.color)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(highlight.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-900 line-clamp-2">
                  {highlight.text}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopyHighlight(highlight)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveHighlight(highlight.id, url)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 