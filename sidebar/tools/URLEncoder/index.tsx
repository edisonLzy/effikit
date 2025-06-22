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
  Link,
  AlertCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { useURLEncoder } from './useURLEncoder';

export function URLEncoder() {
  const { state, actions, data, suggestedMode } = useURLEncoder();

  return (
    <div className="flex flex-col h-full bg-black p-6">
      {/* 标题区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">URL 编码/解码工具</h1>
        </div>
        <p className="text-gray-300">
          对URL进行编码和解码处理，支持中文字符和特殊符号
        </p>
      </div>

      <div className="flex-1 space-y-6">
        {/* 输入区域 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-4">
            {/* 标题和模式切换 */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">
                {state.mode === 'encode' ? '原始文本' : '编码文本'}
              </Label>
              
              <div className="flex items-center gap-2">
                {/* 转换模式切换 */}
                <div className="flex gap-1">
                  <Badge 
                    variant={state.mode === 'encode' ? 'default' : 'secondary'}
                    className={`cursor-pointer text-xs ${
                      state.mode === 'encode' 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => actions.setMode('encode')}
                  >
                    编码
                  </Badge>
                  <Badge 
                    variant={state.mode === 'decode' ? 'default' : 'secondary'}
                    className={`cursor-pointer text-xs ${
                      state.mode === 'decode' 
                        ? 'bg-white text-black hover:bg-gray-200' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => actions.setMode('decode')}
                  >
                    解码
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.toggleMode}
                  className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                  title="切换模式"
                >
                  <ArrowUpDown className="w-3 h-3" />
                </Button>
                
                {state.input && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.clearInput}
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title="清空输入"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* 智能模式建议 */}
            {suggestedMode && (
              <div className="flex items-center gap-2 text-yellow-400 text-xs">
                <Lightbulb className="w-3 h-3" />
                <span>
                  建议使用
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => actions.setMode(suggestedMode as 'encode' | 'decode')}
                    className="px-1 py-0 h-auto text-yellow-400 hover:text-yellow-300 underline text-xs"
                  >
                    {suggestedMode === 'encode' ? '编码' : '解码'}
                  </Button>
                  模式
                </span>
              </div>
            )}
            
            <Input
              placeholder={
                state.mode === 'encode' 
                  ? '输入需要编码的URL或文本...' 
                  : '输入需要解码的URL编码文本...'
              }
              value={state.input}
              onChange={(e) => actions.setInput(e.target.value)}
              className="min-h-[100px] resize-none bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
              style={{ height: 'auto' }}
            />
          </div>
        </Card>

        {/* 结果区域 */}
        <Card className="p-4 bg-gray-900 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">
                {state.mode === 'encode' ? '编码结果' : '解码结果'}
              </Label>
              
              {data.result && !data.isError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.copyResult}
                  className="gap-1 h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  {state.copied ? (
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
              )}
            </div>
            
            <div 
              className={`
                min-h-[100px] p-3 border rounded-md font-mono text-sm
                ${data.result ? 'text-white' : 'text-gray-400'}
                ${data.isError ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-800 border-gray-600'}
                break-all
              `}
            >
              {data.isError && (
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">转换失败</span>
                </div>
              )}
              {data.result || '转换结果将在这里显示...'}
            </div>
          </div>
        </Card>


      </div>
    </div>
  );
} 