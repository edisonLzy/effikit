import { SpacePlanet } from './SpacePlanet';
import { SpaceStars } from './SpaceStars';
import { SpaceParticles } from './SpaceParticles';

interface SpaceBackgroundProps {
  theme?: 'default' | 'error';
}

export function SpaceBackground({ theme = 'default' }: SpaceBackgroundProps) {
  const planetColors = theme === 'error' 
    ? {
        planet1: 'from-red-900 to-red-950 hover:from-red-700 hover:to-red-800',
        planet2: 'from-orange-900 to-orange-950 hover:from-orange-700 hover:to-orange-800',
        planet3: 'from-red-900 to-red-950 hover:from-red-700 hover:to-red-800',
        planet4: 'from-yellow-900 to-yellow-950 hover:from-yellow-700 hover:to-yellow-800',
        planet5: 'from-red-900 to-red-950 hover:from-red-700 hover:to-red-800',
        innerColors: {
          planet1: 'from-red-800 to-red-900',
          planet2: 'from-orange-800 to-orange-900',
          planet3: 'from-red-800 to-red-900',
          planet4: 'from-yellow-800 to-yellow-900',
          planet5: 'from-red-800 to-red-900'
        }
      }
    : {
        planet1: 'from-red-900 to-red-950 hover:from-red-700 hover:to-red-800',
        planet2: 'from-purple-900 to-purple-950 hover:from-purple-700 hover:to-purple-800',
        planet3: 'from-blue-900 to-blue-950 hover:from-blue-700 hover:to-blue-800',
        planet4: 'from-green-900 to-green-950 hover:from-green-700 hover:to-green-800',
        planet5: 'from-yellow-900 to-yellow-950 hover:from-yellow-700 hover:to-yellow-800',
        innerColors: {
          planet1: 'from-red-800 to-red-900',
          planet2: 'from-purple-800 to-purple-900',
          planet3: 'from-blue-800 to-blue-900',
          planet4: 'from-green-800 to-green-900',
          planet5: 'from-yellow-800 to-yellow-900'
        }
      };

  return (
    <>
      {/* 背景粒子效果 */}
      <SpaceParticles theme={theme} />
      
      {/* 浮动星星 */}
      <SpaceStars theme={theme} />
      
      {/* 背景星球 - 添加轨道动画和交互效果 */}
      <SpacePlanet className={`top-20 left-10 ${theme === 'error' ? 'w-14 h-14' : 'w-16 h-16'} bg-gradient-to-br ${planetColors.planet1} animate-orbit-slow`}>
        <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${planetColors.innerColors.planet1} animate-pulse`}></div>
      </SpacePlanet>
      
      <SpacePlanet className={`top-32 right-20 ${theme === 'error' ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br ${planetColors.planet2} animate-orbit-medium`}>
        <div className={`absolute inset-1 rounded-full bg-gradient-to-br ${planetColors.innerColors.planet2} animate-pulse delay-500`}></div>
      </SpacePlanet>
      
      <SpacePlanet className={`bottom-40 left-20 ${theme === 'error' ? 'w-16 h-16' : 'w-20 h-20'} bg-gradient-to-br ${planetColors.planet3} animate-orbit-fast`}>
        <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${planetColors.innerColors.planet3} animate-pulse delay-1000`}></div>
      </SpacePlanet>
      
      <SpacePlanet className={`bottom-20 right-16 ${theme === 'error' ? 'w-12 h-12' : 'w-14 h-14'} bg-gradient-to-br ${planetColors.planet4} animate-orbit-slow delay-2000`}>
        <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${planetColors.innerColors.planet4} animate-pulse delay-1500`}></div>
      </SpacePlanet>
      
      {theme === 'default' && (
        <SpacePlanet className="top-1/2 left-5 w-8 h-8 bg-gradient-to-br from-yellow-900 to-yellow-950 animate-orbit-medium delay-1000 hover:from-yellow-700 hover:to-yellow-800">
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-800 to-yellow-900 animate-pulse delay-2000"></div>
        </SpacePlanet>
      )}
    </>
  );
} 