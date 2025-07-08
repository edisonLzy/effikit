import { useState } from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ErrorTestComponent() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    throw new Error('这是一个测试错误，用于验证错误边界功能！');
  }

  return (
    <div className="p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            错误边界测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            点击下面的按钮来测试错误边界组件是否正常工作。
          </p>
          
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <strong>注意：</strong>点击按钮会故意触发一个错误，这将激活错误边界组件。
              </p>
            </div>
          </div>

          <Button 
            onClick={() => setShouldThrowError(true)}
            variant="destructive"
            className="w-full"
          >
            <Bug className="w-4 h-4 mr-2" />
            触发测试错误
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 