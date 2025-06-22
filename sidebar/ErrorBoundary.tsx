import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Zap } from "lucide-react";
import { SpaceBackground } from "./components/SpaceBackground";
import { ErrorRobot } from "./components/SpaceCharacters";

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

  return (
    <div className="relative min-h-screen bg-[#0A0B16] overflow-hidden flex items-center justify-center">
      {/* 太空背景 - 错误主题 */}
      <SpaceBackground theme="error" />
      
      {/* 主要内容区域 */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* 错误机器人 */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <ErrorRobot />
        </div>
        
        {/* 错误状态码或图标 */}
        <div className="mb-6 animate-fade-in-up delay-500">
          {errorStatus === 404 ? (
            <div className="text-6xl font-bold text-red-400 animate-bounce-text">404</div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-500/20 rounded-full animate-pulse">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
          )}
        </div>
        
        {/* 错误标题 */}
        <div className="mb-6 animate-fade-in-up delay-1000">
          <h1 className="text-4xl font-bold text-white mb-2 animate-bounce-text hover:text-red-300 transition-colors duration-300 cursor-pointer">
            SYSTEM ERROR!
          </h1>
          <p className="text-xl text-red-300 uppercase tracking-wide animate-fade-in delay-1500">
            {errorStatus === 404 ? "Page Not Found" : "Application Error"}
          </p>
        </div>
        
        {/* 错误描述 */}
        <div className="mb-8 animate-fade-in-up delay-1500">
          <p className="text-white/80 mb-4">
            {errorStatus === 404 
              ? "您访问的页面在太空中迷失了方向..."
              : "系统遇到了意外故障，正在尝试修复..."
            }
          </p>
          
          {errorStatus !== 404 && (
            <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg mb-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-medium">错误详情</span>
              </div>
              <p className="text-sm text-red-200 font-mono break-all text-left">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-2000">
          <Button 
            asChild 
            variant="outline" 
            className="px-6 py-3 bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wide hover:scale-105 hover:shadow-lg hover:shadow-white/20 hover:border-blue-400"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              GO HOME
            </Link>
          </Button>
        </div>
        
        {/* 底部提示 */}
        <div className="mt-8 animate-fade-in delay-2500">
          <p className="text-xs text-white/50">
            系统正在自动诊断中... 如果问题持续存在，请联系地面控制中心
          </p>
        </div>
      </div>
      
      {/* 装饰性连接线 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-40 opacity-10 hover:opacity-20 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 320 156" fill="none">
          <path 
            d="M0 78 Q160 0 320 78" 
            stroke="#FF4444" 
            strokeWidth="1" 
            fill="none"
            className="animate-draw-line hover:stroke-red-400 transition-colors duration-300"
            strokeDasharray="320"
            strokeDashoffset="320"
          />
        </svg>
      </div>
    </div>
  );
}