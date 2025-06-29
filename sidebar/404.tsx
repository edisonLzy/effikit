import { Link, useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { SpaceBackground } from './components/SpaceBackground';
import { Astronaut, Rocket } from './components/SpaceCharacters';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0A0B16] overflow-hidden flex items-center justify-center">
      {/* 太空背景 */}
      <SpaceBackground theme="default" />
      
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