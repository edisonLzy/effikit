export function Astronaut() {
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

export function Rocket() {
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

export function ErrorRobot() {
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