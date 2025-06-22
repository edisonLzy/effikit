interface SpacePlanetProps {
  className?: string;
  children?: React.ReactNode;
}

export function SpacePlanet({ className, children }: SpacePlanetProps) {
  return (
    <div className={`absolute rounded-full ${className} hover:scale-110 transition-transform duration-300 cursor-pointer`}>
      {children}
    </div>
  );
} 