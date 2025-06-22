import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  RotateCcw, 
  ArrowUpDown, 
  Check,
  Key,
  AlertTriangle,
  Upload,
  Download,
  Image as ImageIcon
} from 'lucide-react';

type ConversionMode = 'encode' | 'decode';

export function Base64Encoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [copied, setCopied] = useState(false);

  // Base64编解码
  const result = useMemo(() => {
    if (!input.trim()) return null;

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        return {
          isValid: true,
          data: encoded,
          originalSize: new Blob([input]).size,
          encodedSize: new Blob([encoded]).size,
          error: null
        };
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        return {
          isValid: true,
          data: decoded,
          originalSize: new Blob([input]).size,
          encodedSize: new Blob([decoded]).size,
          error: null
        };
      }
    } catch (error) {
      return {
        isValid: false,
        data: '',
        originalSize: 0,
        encodedSize: 0,
        error: error instanceof Error ? error.message : '转换失败'
      };
    }
  }, [input, mode]);

  // 复制到剪贴板
  const copyResult = useCallback(async () => {
    if (!result?.data) return;

    try {
      await navigator.clipboard.writeText(result.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, [result]);

  // 清空输入
  const clearInput = useCallback(() => {
    setInput('');
  }, []);

  // 切换模式
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
  }, []);

  // 文件上传处理
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.type.startsWith('image/')) {
        // 图片文件，直接设置base64
        const base64 = content.split(',')[1]; // 去掉data:image/...;base64,前缀
        if (mode === 'encode') {
          setInput(file.name); // 编码模式下显示文件名
        } else {
          setInput(base64); // 解码模式下设置base64数据
        }
      } else {
        // 文本文件
        setInput(content);
      }
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  }, [mode]);

  // 下载结果
  const downloadResult = useCallback(() => {
    if (!result?.data) return;

    const blob = new Blob([result.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, mode]);

  return (
    <div className="flex flex-col h-full bg-black p-6 overflow-auto">
      {/* 标题区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Base64 编码/解码</h1>
        </div>
        <p className="text-gray-300">
          支持文本和图片的Base64编码解码转换
        </p>
      </div>

      <div className="flex-1 space-y-6">
        {/* 输入区域 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-4">
            {/* 标题和模式切换 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">
                {mode === 'encode' ? '原始数据' : 'Base64数据'}
              </Label>
              
              <div className="flex items-center gap-2">
                {/* 转换模式切换 */}
                <div className="flex gap-1">
                  <Badge 
                    variant={mode === 'encode' ? 'default' : 'secondary'}
                    className={`cursor-pointer text-xs ${
                      mode === 'encode' 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setMode('encode')}
                  >
                    编码
                  </Badge>
                  <Badge 
                    variant={mode === 'decode' ? 'default' : 'secondary'}
                    className={`cursor-pointer text-xs ${
                      mode === 'decode' 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setMode('decode')}
                  >
                    解码
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMode}
                  className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                  title="切换模式"
                >
                  <ArrowUpDown className="w-3 h-3" />
                </Button>

                {/* 文件上传 */}
                <input
                  type="file"
                  accept={mode === 'encode' ? '*/*' : '.txt'}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title={mode === 'encode' ? '上传文件进行编码' : '上传文本文件'}
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
                  variant={result?.isValid ? 'default' : 'destructive'}
                  className={result?.isValid 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                  }
                >
                  {result?.isValid ? '有效' : '错误'}
                </Badge>
                <span className="text-gray-400">
                  大小: {result?.originalSize} 字节
                </span>
              </div>
            )}
            
            <textarea
              placeholder={
                mode === 'encode' 
                  ? '输入需要编码的文本或上传文件...' 
                  : '输入需要解码的Base64数据...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-40 p-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm font-mono placeholder:text-gray-400 focus:border-white resize-none"
            />
          </div>
        </Card>

        {/* 结果区域 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-4">
            {/* 标题和操作按钮 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">
                {mode === 'encode' ? 'Base64结果' : '解码结果'}
              </Label>
              
              {result?.isValid && result.data && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadResult}
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title="下载结果"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyResult}
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
            {result?.isValid && (
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>结果大小: {result.encodedSize} 字节</span>
                {mode === 'encode' && (
                  <span>
                    增长: {Math.round((result.encodedSize / result.originalSize - 1) * 100)}%
                  </span>
                )}
              </div>
            )}
            
            {/* 结果显示 */}
            <div 
              className={`
                min-h-[160px] p-3 border rounded-md font-mono text-sm overflow-auto
                ${result?.isValid 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-red-900/20 border-red-500/50'
                }
                break-all
              `}
            >
              {result?.isValid ? (
                <pre className="whitespace-pre-wrap">
                  {result.data || '转换结果将在这里显示...'}
                </pre>
              ) : result?.error ? (
                <div className="text-red-400">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold">转换错误</span>
                  </div>
                  <div className="text-xs">{result.error}</div>
                </div>
              ) : (
                <div className="text-gray-400">转换结果将在这里显示...</div>
              )}
            </div>
          </div>
        </Card>

        {/* 使用提示 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">使用提示</Label>
            <div className="space-y-2 text-xs text-gray-400">
              <div>• <strong>编码模式:</strong> 将普通文本转换为Base64格式</div>
              <div>• <strong>解码模式:</strong> 将Base64数据转换回原始文本</div>
              <div>• <strong>文件支持:</strong> 支持上传文本文件和图片文件进行编码</div>
              <div>• <strong>安全提示:</strong> Base64编码不是加密，仅用于数据传输编码</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 