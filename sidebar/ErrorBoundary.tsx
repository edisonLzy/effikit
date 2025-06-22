import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw, Bug, Zap } from "lucide-react";

function Planet({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`absolute rounded-full ${className} hover:scale-110 transition-transform duration-300 cursor-pointer`}>
      {children}
    </div>
  );
}

function ErrorRobot() {
  return (
    <div className="relative w-32 h-40 animate-bounce hover:animate-pulse transition-all duration-300 cursor-pointer group">
      <svg className="w-full h-full group-hover:scale-105 transition-transform duration-300" viewBox="0 0 128 160" fill="none">
        {/* 机器人头部 */}
        <rect x="24" y="20" width="80" height="60" rx="20" fill="#C0C0C0" />
        <rect x="28" y="24" width="72" height="52" rx="16" fill="#E0E0E0" />
        
        {/* 眼睛 - 错误状态 */}
        <circle cx="45" cy="45" r="8" fill="#FF4444" className="animate-ping group-hover:fill-red-600" />
        <circle cx="83" cy="45" r="8" fill="#FF4444" className="animate-ping delay-500 group-hover:fill-red-600" />
        <circle cx="45" cy="45" r="4" fill="#FF0000" className="animate-pulse" />
        <circle cx="83" cy="45" r="4" fill="#FF0000" className="animate-pulse delay-300" />
        
        {/* 嘴巴 - 错误表情 */}
        <path d="M50 60 Q64 50 78 60" stroke="#666" strokeWidth="2" fill="none" className="group-hover:stroke-red-500" />
        
        {/* 身体 */}
        <rect x="32" y="80" width="64" height="70" rx="10" fill="#B0B0B0" />
        
        {/* 胸前错误指示器 */}
        <rect x="44" y="95" width="40" height="25" rx="5" fill="#333" />
        <rect x="48" y="99" width="32" height="17" rx="3" fill="#FF4444" className="animate-pulse" />
        <text x="64" y="110" textAnchor="middle" className="text-xs fill-white font-bold">ERROR</text>
        
        {/* 手臂 */}
        <rect x="12" y="90" width="16" height="40" rx="8" fill="#B0B0B0" className="group-hover:animate-bounce" />
        <rect x="100" y="90" width="16" height="40" rx="8" fill="#B0B0B0" className="group-hover:animate-bounce delay-200" />
        
        {/* 腿部 */}
        <rect x="40" y="145" width="16" height="25" rx="8" fill="#B0B0B0" />
        <rect x="72" y="145" width="16" height="25" rx="8" fill="#B0B0B0" />
        
        {/* 天线 */}
        <line x1="64" y1="20" x2="64" y2="10" stroke="#888" strokeWidth="2" />
        <circle cx="64" cy="8" r="3" fill="#FF4444" className="animate-pulse" />
        
        {/* 错误火花 */}
        <g className="animate-ping">
          <path d="M20 70 L28 68 L24 76 L32 74" stroke="#FFD700" strokeWidth="2" fill="#FFD700" opacity="0.7" />
          <path d="M96 85 L104 83 L100 91 L108 89" stroke="#FFD700" strokeWidth="2" fill="#FFD700" opacity="0.7" />
        </g>
      </svg>
      
      {/* 错误光环效果 */}
      <div className="absolute inset-0 rounded-full bg-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
    </div>
  );
}

function FloatingStars() {
  return (
    <>
      {/* 错误主题的红色星星 */}
      <div className="absolute top-10 left-1/4 w-1 h-1 bg-red-400 rounded-full animate-twinkle hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute top-20 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-twinkle delay-1000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-red-400 rounded-full animate-twinkle delay-2000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute bottom-10 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-twinkle delay-3000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute top-1/3 left-10 w-1 h-1 bg-red-400 rounded-full animate-twinkle delay-4000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute top-2/3 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-twinkle delay-5000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
    </>
  );
}

function ErrorParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 错误粒子 - 红色和橙色主题 */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-red-400/40 rounded-full animate-float-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-orange-400/40 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 bg-yellow-400/40 rounded-full animate-float-fast"></div>
      <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-red-400/40 rounded-full animate-float-slow delay-2000"></div>
      <div className="absolute top-1/2 left-1/6 w-0.5 h-0.5 bg-orange-400/40 rounded-full animate-float-medium delay-1000"></div>
      <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-red-400/40 rounded-full animate-float-fast delay-3000"></div>
    </div>
  );
}

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
    console.error("用户报告错误:", { error, errorMessage, errorStatus });
    alert("错误已报告，感谢您的反馈！");
  };

  return (
    <div className="relative min-h-screen bg-[#0A0B16] overflow-hidden flex items-center justify-center">
      {/* 背景粒子效果 */}
      <ErrorParticles />
      
      {/* 浮动星星 */}
      <FloatingStars />
      
      {/* 背景星球 - 错误主题颜色 */}
      <Planet className="top-20 left-10 w-14 h-14 bg-gradient-to-br from-red-900 to-red-950 animate-orbit-slow hover:from-red-700 hover:to-red-800">
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-800 to-red-900 animate-pulse"></div>
      </Planet>
      
      <Planet className="top-32 right-20 w-10 h-10 bg-gradient-to-br from-orange-900 to-orange-950 animate-orbit-medium hover:from-orange-700 hover:to-orange-800">
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-orange-800 to-orange-900 animate-pulse delay-500"></div>
      </Planet>
      
      <Planet className="bottom-40 left-20 w-16 h-16 bg-gradient-to-br from-red-900 to-red-950 animate-orbit-fast hover:from-red-700 hover:to-red-800">
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-800 to-red-900 animate-pulse delay-1000"></div>
      </Planet>
      
      <Planet className="bottom-20 right-16 w-12 h-12 bg-gradient-to-br from-yellow-900 to-yellow-950 animate-orbit-slow delay-2000 hover:from-yellow-700 hover:to-yellow-800">
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-800 to-yellow-900 animate-pulse delay-1500"></div>
      </Planet>
      
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