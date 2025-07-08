import { useState, useCallback, useMemo } from 'react';
import { 
  Copy, 
  RotateCcw, 
  FileText,
  Check,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function JSONViewer() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  // JSON解析和格式化
  const jsonData = useMemo(() => {
    if (!input.trim()) return null;
    
    try {
      const parsed = JSON.parse(input);
      return {
        isValid: true,
        formatted: JSON.stringify(parsed, null, 2),
        minified: JSON.stringify(parsed),
        parsed,
        size: new Blob([input]).size,
        formattedSize: new Blob([JSON.stringify(parsed, null, 2)]).size,
        error: null
      };
    } catch (error) {
      return {
        isValid: false,
        formatted: '',
        minified: '',
        parsed: null,
        size: new Blob([input]).size,
        formattedSize: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }, [input]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, []);

  // 清空输入
  const clearInput = useCallback(() => {
    setInput('');
  }, []);

  // 下载JSON文件
  const downloadJSON = useCallback(() => {
    if (!jsonData?.isValid) return;
    
    const blob = new Blob([jsonData.formatted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jsonData]);

  // 文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-black p-6">
      {/* 标题区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">JSON 查看器</h1>
        </div>
        <p className="text-gray-300">
          JSON格式化、验证、压缩和美化工具
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-4">
            {/* 标题和操作按钮 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">
                JSON 输入
              </Label>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
                <label htmlFor="json-upload">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title="上传JSON文件"
                    asChild
                  >
                    <span>
                      <Upload className="w-3 h-3" />
                    </span>
                  </Button>
                </label>
                
                {input && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearInput}
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title="清空输入"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* 状态信息 */}
            {input && (
              <div className="flex items-center gap-2 text-xs">
                <Badge 
                  variant={jsonData?.isValid ? 'default' : 'destructive'}
                  className={jsonData?.isValid 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                  }
                >
                  {jsonData?.isValid ? '有效' : '无效'}
                </Badge>
                <span className="text-gray-400">
                  大小: {jsonData?.size} 字节
                </span>
              </div>
            )}
            
            <textarea
              placeholder="粘贴或输入JSON数据..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-80 p-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm font-mono placeholder:text-gray-400 focus:border-white resize-none"
            />
          </div>
        </Card>

        {/* 结果区域 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-4">
            {/* 标题和操作按钮 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">
                格式化结果
              </Label>
              
              {jsonData?.isValid && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadJSON}
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title="下载JSON"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(jsonData.formatted)}
                    className="gap-1 h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {/* 统计信息 */}
            {jsonData?.isValid && (
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>格式化大小: {jsonData.formattedSize} 字节</span>
                <span>压缩率: {Math.round((1 - jsonData.size / jsonData.formattedSize) * 100)}%</span>
              </div>
            )}
            
            {/* 结果显示 */}
            <div 
              className={`
                h-80 p-3 border rounded-md font-mono text-sm overflow-auto
                ${jsonData?.isValid 
      ? 'bg-gray-800 border-gray-600 text-white' 
      : 'bg-red-900/20 border-red-500/50'
    }
              `}
            >
              {jsonData?.isValid ? (
                <pre className="whitespace-pre-wrap break-all">
                  {jsonData.formatted || '等待输入JSON数据...'}
                </pre>
              ) : jsonData?.error ? (
                <div className="text-red-400">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold">JSON语法错误</span>
                  </div>
                  <div className="text-xs">{jsonData.error}</div>
                </div>
              ) : (
                <div className="text-gray-400">等待输入JSON数据...</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 快速操作区域 */}
      {jsonData?.isValid && (
        <Card className="mt-6 p-4 bg-gray-900 border-gray-700">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">快速操作</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(jsonData.minified)}
                className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                复制压缩版本
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(jsonData.formatted)}
                className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                复制格式化版本
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput(jsonData.minified)}
                className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                压缩当前JSON
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 