interface SpaceParticlesProps {
  theme?: 'default' | 'error';
}

export function SpaceParticles({ theme = 'default' }: SpaceParticlesProps) {
  const particleColors = theme === 'error' 
    ? ['bg-red-400/40', 'bg-orange-400/40', 'bg-yellow-400/40'] 
    : ['bg-blue-400/30', 'bg-purple-400/30', 'bg-yellow-400/30', 'bg-green-400/30', 'bg-red-400/30', 'bg-pink-400/30'];

  const getParticleColor = (index: number) => {
    return particleColors[index % particleColors.length];
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 浮动粒子 */}
      <div className={`absolute top-1/4 left-1/4 w-1 h-1 ${getParticleColor(0)} rounded-full animate-float-slow`}></div>
      <div className={`absolute top-1/3 right-1/4 w-1.5 h-1.5 ${getParticleColor(1)} rounded-full animate-float-medium`}></div>
      <div className={`absolute bottom-1/4 left-1/3 w-0.5 h-0.5 ${getParticleColor(2)} rounded-full animate-float-fast`}></div>
      <div className={`absolute bottom-1/3 right-1/3 w-1 h-1 ${getParticleColor(3)} rounded-full animate-float-slow delay-2000`}></div>
      <div className={`absolute top-1/2 left-1/6 w-0.5 h-0.5 ${getParticleColor(4)} rounded-full animate-float-medium delay-1000`}></div>
      <div className={`absolute top-2/3 right-1/6 w-1.5 h-1.5 ${getParticleColor(5)} rounded-full animate-float-fast delay-3000`}></div>
    </div>
  );
} 