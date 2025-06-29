import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Code, AlertTriangle, Wand2, Copy, Check } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import type { HttpRequest } from './types';

interface MockDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: HttpRequest | null;
  onSave: (requestId: string, mockData: string, statusCode?: number) => void;
}

export function MockDataDialog(props: MockDataDialogProps) {
  const { isOpen, onClose, request, onSave } = props;
  const [mockData, setMockData] = useState('');
  const [statusCode, setStatusCode] = useState(200);
  const [isValidJson, setIsValidJson] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (request) {
      setMockData(request.mockData || '');
      setStatusCode(200);
    }
  }, [request]);

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setIsValidJson(true);
      return;
    }
    
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleMockDataChange = useCallback((value: string) => {
    setMockData(value);
    validateJson(value);
  }, []);

  const formatJson = useCallback(() => {
    if (!mockData.trim()) return;
    
    try {
      const parsed = JSON.parse(mockData);
      const formatted = JSON.stringify(parsed, null, 2);
      setMockData(formatted);
      setIsValidJson(true);
    } catch {
      // 如果无法解析，保持原样
    }
  }, [mockData]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mockData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  }, [mockData]);

  const insertTemplate = useCallback((template: string) => {
    setMockData(template);
    validateJson(template);
  }, []);

  const handleSave = () => {
    if (request && isValidJson) {
      onSave(request.id, mockData, statusCode);
      onClose();
    }
  };

  const handleClose = () => {
    setMockData('');
    setStatusCode(200);
    setIsValidJson(true);
    setIsCopied(false);
    onClose();
  };

  // 常用模板
  const templates = {
    success: '{\n  "success": true,\n  "message": "操作成功",\n  "data": {}\n}',
    error: '{\n  "success": false,\n  "message": "操作失败",\n  "error": "错误信息"\n}',
    list: '{\n  "success": true,\n  "data": {\n    "list": [],\n    "total": 0,\n    "page": 1,\n    "pageSize": 10\n  }\n}',
    user: '{\n  "success": true,\n  "data": {\n    "id": 1,\n    "name": "用户名",\n    "email": "user@example.com"\n  }\n}'
  };

  if (!isOpen || !request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-background rounded-lg shadow-xl border w-full max-w-3xl flex flex-col max-h-[90vh]">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/20 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">编辑Mock响应</h2>
              <p className="text-sm text-muted-foreground">
                {request.method} {request.url}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 表单内容 - 可滚动区域 */}
        <div className="flex-1 p-4 space-y-4 overflow-auto min-h-0">
          {/* 状态码 */}
          <div className="space-y-2">
            <Label htmlFor="statusCode" className="text-sm font-medium">HTTP状态码</Label>
            <Input
              id="statusCode"
              type="number"
              value={statusCode}
              onChange={(e) => setStatusCode(Number(e.target.value))}
              placeholder="200"
              min="100"
              max="599"
              className="w-32"
            />
          </div>

          {/* Mock数据 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="mockData" className="text-sm font-medium">响应数据</Label>
              <div className="flex items-center gap-2">
                {/* 模板选择 */}
                <div className="flex gap-1">
                  {Object.entries(templates).map(([key, template]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      onClick={() => insertTemplate(template)}
                      className="h-7 px-2 text-xs"
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-t-md border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">JSON编辑器</span>
                {!isValidJson && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="w-3 h-3" />
                    语法错误
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={formatJson}
                  disabled={!isValidJson || !mockData.trim()}
                  className="h-7 px-2"
                  title="格式化JSON"
                >
                  <Wand2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  disabled={!mockData.trim()}
                  className="h-7 px-2"
                  title="复制到剪贴板"
                >
                  {isCopied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* CodeMirror编辑器 */}
            <div className="border rounded-b-md overflow-hidden">
              <CodeMirror
                value={mockData}
                onChange={handleMockDataChange}
                extensions={[json()]}
                theme={isDarkTheme ? oneDark : undefined}
                height="300px"
                placeholder='输入Mock响应数据，例如：{"success": true, "data": "Hello World"}'
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: false,
                }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              提示：支持JSON语法高亮和自动格式化。可以使用上方模板快速插入常用格式。
            </p>
          </div>
        </div>

        {/* 底部按钮 - 固定区域 */}
        <div className="border-t bg-muted/10 p-4 rounded-b-lg">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="min-w-[80px]"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidJson}
              className="flex items-center gap-2 min-w-[100px]"
            >
              <Save className="w-4 h-4" />
              保存Mock
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 