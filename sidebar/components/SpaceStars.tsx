interface SpaceStarsProps {
  theme?: 'default' | 'error';
}

export function SpaceStars({ theme = 'default' }: SpaceStarsProps) {
  const starColors = theme === 'error' 
    ? ['bg-red-400', 'bg-yellow-400', 'bg-orange-400'] 
    : ['bg-white'];

  const getStarColor = (index: number) => {
    if (theme === 'error') {
      return starColors[index % starColors.length];
    }
    return starColors[0];
  };

  return (
    <>
      {/* 小星星动画 */}
      <div className={`absolute top-10 left-1/4 w-1 h-1 ${getStarColor(0)} rounded-full animate-twinkle hover:scale-150 transition-transform duration-300 cursor-pointer`}></div>
      <div className={`absolute top-20 right-1/3 w-1 h-1 ${getStarColor(1)} rounded-full animate-twinkle delay-1000 hover:scale-150 transition-transform duration-300 cursor-pointer`}></div>
      <div className={`absolute bottom-32 left-1/3 w-1 h-1 ${getStarColor(2)} rounded-full animate-twinkle delay-2000 hover:scale-150 transition-transform duration-300 cursor-pointer`}></div>
      <div className={`absolute bottom-10 right-1/4 w-1 h-1 ${getStarColor(0)} rounded-full animate-twinkle delay-3000 hover:scale-150 transition-transform duration-300 cursor-pointer`}></div>
      <div className={`absolute top-1/3 left-10 w-1 h-1 ${getStarColor(1)} rounded-full animate-twinkle delay-4000 hover:scale-150 transition-transform duration-300 cursor-pointer`}></div>
      <div className={`absolute top-2/3 right-10 w-1 h-1 ${getStarColor(2)} rounded-full animate-twinkle delay-5000 hover:scale-150 transition-transform duration-300 cursor-pointer`}></div>
      
      {/* 更多装饰星星 */}
      {theme === 'default' && (
        <>
          <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-6000"></div>
          <div className="absolute top-3/4 left-1/5 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-7000"></div>
          <div className="absolute top-1/2 right-1/5 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-8000"></div>
        </>
      )}
    </>
  );
} 