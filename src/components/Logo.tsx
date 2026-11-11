import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  variant?: 'white' | 'dark' | 'auto';
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ variant = 'auto', className = 'h-10 sm:h-12', showTagline = false }: LogoProps) {
  const { theme } = useTheme();

  // Determine logo variant based on prop or active theme
  const activeVariant =
    variant === 'auto'
      ? theme === 'light'
        ? 'dark'
        : 'white'
      : variant;

  const logoSrc = activeVariant === 'white' ? '/bettercars-logo-white.png' : '/bettercars-logo.png';

  return (
    <div className="flex items-center gap-2 select-none group">
      <img
        src={logoSrc}
        alt="BetterCars - Everyone Deserves"
        className={`${className} w-auto object-contain transition-all duration-300 group-hover:scale-105 filter drop-shadow-sm`}
        draggable={false}
      />
      {showTagline && (
        <span className={`hidden lg:inline-block text-[10px] uppercase tracking-[0.28em] font-semibold border-l pl-3 ml-1 transition-colors ${
          theme === 'dark' ? 'text-white/45 border-white/20' : 'text-gray-500 border-gray-300'
        }`}>
          Everyone Deserves
        </span>
      )}
    </div>
  );
}
