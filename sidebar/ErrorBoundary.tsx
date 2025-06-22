import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw, Bug } from "lucide-react";

export function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: string | number = "错误";

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText || "发生了未知错误";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = "发生了未知错误";
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    // 这里可以添加错误报告逻辑
    console.error("用户报告错误:", { error, errorMessage, errorStatus });
    alert("错误已报告，感谢您的反馈！");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-red-600">
            {errorStatus === 404 ? "页面未找到" : "应用程序错误"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {errorStatus === 404 
                ? "您访问的页面不存在或已被移动。"
                : "抱歉，应用程序遇到了一个错误。"
              }
            </p>
            
            {errorStatus !== 404 && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700 font-mono break-all">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>

            {errorStatus !== 404 && (
              <Button 
                variant="outline" 
                onClick={handleReload}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新加载页面
              </Button>
            )}

            <Button 
              variant="ghost" 
              onClick={handleReportError}
              className="w-full text-sm"
            >
              <Bug className="w-4 h-4 mr-2" />
              报告此问题
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              如果问题持续存在，请联系技术支持
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}