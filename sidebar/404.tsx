import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

function Planet({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`absolute rounded-full ${className} hover:scale-110 transition-transform duration-300 cursor-pointer`}>
      {children}
    </div>
  );
}

function Astronaut() {
  return (
    <div className="relative w-36 h-52 animate-bounce hover:animate-pulse transition-all duration-300 cursor-pointer group">
      {/* 宇航员身体 */}
      <svg className="w-full h-full group-hover:scale-105 transition-transform duration-300" viewBox="0 0 141 203" fill="none">
        {/* 头盔 */}
        <ellipse cx="70" cy="50" rx="45" ry="40" fill="#CACACA" />
        <ellipse cx="70" cy="50" rx="35" ry="30" fill="rgba(59, 130, 246, 0.3)" className="animate-pulse group-hover:fill-blue-400" />
        
        {/* 身体 */}
        <rect x="30" y="80" width="80" height="100" rx="40" fill="#C0C0C0" />
        
        {/* 胸前控制面板 */}
        <rect x="45" y="95" width="50" height="30" rx="5" fill="#778186" />
        <rect x="50" y="100" width="40" height="20" rx="3" fill="#474B4C" />
        
        {/* 手臂 */}
        <ellipse cx="20" cy="110" rx="15" ry="25" fill="#C0C0C0" className="animate-pulse delay-500 group-hover:animate-bounce" />
        <ellipse cx="120" cy="110" rx="15" ry="25" fill="#C0C0C0" className="animate-pulse delay-700 group-hover:animate-bounce" />
        
        {/* 腿部 */}
        <rect x="45" y="170" width="20" height="30" rx="10" fill="#C0C0C0" />
        <rect x="75" y="170" width="20" height="30" rx="10" fill="#C0C0C0" />
        
        {/* 装饰细节 - 闪烁的指示灯 */}
        <circle cx="60" cy="110" r="3" fill="#D6D6D6" className="animate-ping group-hover:fill-green-400" />
        <circle cx="80" cy="110" r="3" fill="#D6D6D6" className="animate-ping delay-1000 group-hover:fill-red-400" />
        <rect x="55" y="130" width="30" height="2" fill="#9C9C9C" className="animate-pulse group-hover:fill-yellow-400" />
      </svg>
      
      {/* 宇航员光环效果 */}
      <div className="absolute inset-0 rounded-full bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
    </div>
  );
}

function Rocket() {
  return (
    <div className="relative w-28 h-26 animate-pulse hover:animate-bounce transition-all duration-300 cursor-pointer group">
      <svg className="w-full h-full group-hover:scale-110 transition-transform duration-300" viewBox="0 0 111 104" fill="none">
        {/* 火箭主体 */}
        <path d="M55 0L75 80H35L55 0Z" fill="#D2CECE" className="group-hover:fill-gray-300 transition-colors duration-300" />
        <path d="M35 80L75 80L70 100L40 100Z" fill="#8C8B8B" />
        
        {/* 火箭翼 */}
        <path d="M25 60L35 80L15 75Z" fill="#606060" />
        <path d="M85 60L75 80L95 75Z" fill="#606060" />
        
        {/* 火焰 - 动态效果 */}
        <ellipse cx="55" cy="95" rx="15" ry="8" fill="#F67C01" className="animate-pulse group-hover:animate-bounce" />
        <ellipse cx="55" cy="92" rx="10" ry="6" fill="#FFC929" className="animate-pulse delay-200 group-hover:animate-bounce" />
        <ellipse cx="55" cy="90" rx="6" ry="4" fill="#F9F079" className="animate-pulse delay-400 group-hover:animate-bounce" />
        
        {/* 窗户 */}
        <circle cx="55" cy="25" r="8" fill="#393535" />
        <circle cx="55" cy="25" r="6" fill="rgba(59, 130, 246, 0.3)" className="animate-pulse delay-300 group-hover:fill-blue-400" />
      </svg>
      
      {/* 火箭尾迹效果 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
    </div>
  );
}

function FloatingStars() {
  return (
    <>
      {/* 小星星动画 */}
      <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full animate-twinkle hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute top-20 right-1/3 w-1 h-1 bg-white rounded-full animate-twinkle delay-1000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-white rounded-full animate-twinkle delay-2000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute bottom-10 right-1/4 w-1 h-1 bg-white rounded-full animate-twinkle delay-3000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute top-1/3 left-10 w-1 h-1 bg-white rounded-full animate-twinkle delay-4000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      <div className="absolute top-2/3 right-10 w-1 h-1 bg-white rounded-full animate-twinkle delay-5000 hover:scale-150 transition-transform duration-300 cursor-pointer"></div>
      
      {/* 更多装饰星星 */}
      <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-6000"></div>
      <div className="absolute top-3/4 left-1/5 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-7000"></div>
      <div className="absolute top-1/2 right-1/5 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-8000"></div>
    </>
  );
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 浮动粒子 */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-float-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-medium"></div>
      <div className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 bg-yellow-400/30 rounded-full animate-float-fast"></div>
      <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-green-400/30 rounded-full animate-float-slow delay-2000"></div>
      <div className="absolute top-1/2 left-1/6 w-0.5 h-0.5 bg-red-400/30 rounded-full animate-float-medium delay-1000"></div>
      <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-float-fast delay-3000"></div>
    </div>
  );
}

export function NotFoundPage() {

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0A0B16] overflow-hidden flex items-center justify-center">
      {/* 背景粒子效果 */}
      <Particles />
      
      {/* 浮动星星 */}
      <FloatingStars />
      
      {/* 背景星球 - 添加轨道动画和交互效果 */}
      <Planet className="top-20 left-10 w-16 h-16 bg-gradient-to-br from-red-900 to-red-950 animate-orbit-slow hover:from-red-700 hover:to-red-800">
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-800 to-red-900 animate-pulse"></div>
      </Planet>
      
      <Planet className="top-32 right-20 w-12 h-12 bg-gradient-to-br from-purple-900 to-purple-950 animate-orbit-medium hover:from-purple-700 hover:to-purple-800">
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-800 to-purple-900 animate-pulse delay-500"></div>
      </Planet>
      
      <Planet className="bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-950 animate-orbit-fast hover:from-blue-700 hover:to-blue-800">
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-800 to-blue-900 animate-pulse delay-1000"></div>
      </Planet>
      
      <Planet className="bottom-20 right-16 w-14 h-14 bg-gradient-to-br from-green-900 to-green-950 animate-orbit-slow delay-2000 hover:from-green-700 hover:to-green-800">
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-800 to-green-900 animate-pulse delay-1500"></div>
      </Planet>
      
      <Planet className="top-1/2 left-5 w-8 h-8 bg-gradient-to-br from-yellow-900 to-yellow-950 animate-orbit-medium delay-1000 hover:from-yellow-700 hover:to-yellow-800">
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-800 to-yellow-900 animate-pulse delay-2000"></div>
      </Planet>
      
      {/* 主要内容区域 */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-8 mb-8 text-6xl">
          {/* 左侧 4 - 添加打字机效果和悬停动画 */}
          <div className="font-bold text-white leading-none select-none animate-fade-in-left hover:scale-105 hover:text-blue-300 transition-all duration-300 cursor-pointer">
            4
          </div>
          
          {/* 中间宇航员 */}
          <div className="flex flex-col items-center animate-fade-in-up delay-500">
            <Astronaut />
          </div>
          
          {/* 右侧 4 - 添加打字机效果和悬停动画 */}
          <div className="font-bold text-white leading-none select-none animate-fade-in-right hover:scale-105 hover:text-blue-300 transition-all duration-300 cursor-pointer">
            4
          </div>
        </div>
        
        {/* 火箭 - 添加飞行轨迹 */}
        <div className="absolute top-0 right-1/4 transform translate-x-1/2 -translate-y-8 animate-rocket-fly">
          <Rocket />
        </div>
        
        {/* OOPS! 文字 - 添加弹跳动画和悬停效果 */}
        <div className="mb-4 animate-fade-in-up delay-1000">
          <h1 className="text-5xl font-medium text-white mb-2 animate-bounce-text hover:text-yellow-300 transition-colors duration-300 cursor-pointer">OOPS!</h1>
          <p className="text-3xl font-light text-white uppercase tracking-wide animate-fade-in delay-1500 hover:text-gray-300 transition-colors duration-300">
            Page not found
          </p>
        </div>
        
        {/* 按钮组 - 添加滑入动画和增强悬停效果 */}
        <div className="flex gap-4 justify-center mt-8 animate-fade-in-up delay-2000">
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
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wide hover:scale-105 hover:shadow-lg hover:shadow-white/20 hover:border-green-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            GO BACK
          </Button>
        </div>
      </div>
      
      {/* 装饰性连接线 - 添加绘制动画和悬停效果 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-40 opacity-20 hover:opacity-40 transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 320 156" fill="none">
          <path 
            d="M0 78 Q160 0 320 78" 
            stroke="#DDDDDD" 
            strokeWidth="1" 
            fill="none"
            className="animate-draw-line hover:stroke-blue-400 transition-colors duration-300"
            strokeDasharray="320"
            strokeDashoffset="320"
          />
        </svg>
      </div>
    </div>
  );
} 