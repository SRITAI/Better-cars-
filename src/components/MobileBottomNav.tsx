import { useState, useEffect } from 'react';
import { Home, Search, DollarSign, Layers } from 'lucide-react';
import SteeringWheelIcon from './SteeringWheelIcon';
import { useTheme } from '../context/ThemeContext';

interface MobileBottomNavProps {
  onBookTestDrive?: () => void;
}

export default function MobileBottomNav({ onBookTestDrive }: MobileBottomNavProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const libraryEl = document.getElementById('car-library');
      const rtoEl = document.getElementById('rto-check');
      const sellEl = document.getElementById('sell-car');

      if (sellEl && scrollPos >= sellEl.offsetTop) {
        setActiveTab('sell');
      } else if (rtoEl && scrollPos >= rtoEl.offsetTop) {
        setActiveTab('rto');
      } else if (libraryEl && scrollPos >= libraryEl.offsetTop) {
        setActiveTab('library');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, tab: string) => {
    setActiveTab(tab);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Mobile Android App Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t backdrop-blur-xl transition-all duration-300 pb-safe ${
        isDark
          ? 'bg-[#0a0a0e]/95 border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]'
          : 'bg-white/95 border-gray-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-md mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => scrollToSection('top', 'home')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home'
              ? 'text-orange-500 font-bold scale-105'
              : isDark
              ? 'text-white/50 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* 2. Car Library */}
        <button
          onClick={() => scrollToSection('car-library', 'library')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'library'
              ? 'text-orange-500 font-bold scale-105'
              : isDark
              ? 'text-white/50 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Library</span>
        </button>

        {/* 3. Book Test Drive (Center Highlighted Floating Button) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={onBookTestDrive}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-orange-600 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/40 active:scale-95 transition-transform border-2 border-black/40"
            title="Book Free Test Drive"
          >
            <SteeringWheelIcon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">Drive</span>
          </button>
        </div>

        {/* 4. RTO Check */}
        <button
          onClick={() => scrollToSection('rto-check', 'rto')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'rto'
              ? 'text-orange-500 font-bold scale-105'
              : isDark
              ? 'text-white/50 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-4 h-4 mb-1" />
          <span className="text-[10px]">RTO RC</span>
        </button>

        {/* 5. Sell Car */}
        <button
          onClick={() => scrollToSection('sell-car', 'sell')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'sell'
              ? 'text-orange-500 font-bold scale-105'
              : isDark
              ? 'text-white/50 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-4 h-4 mb-1" />
          <span className="text-[10px]">Sell Car</span>
        </button>
      </div>
    </nav>
  );
}
