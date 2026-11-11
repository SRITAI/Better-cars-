import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Heart, User, ChevronDown, Menu, X, Sun, Moon, Shield
} from 'lucide-react';
import Logo from './Logo';
import SteeringWheelIcon from './SteeringWheelIcon';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

interface NavbarProps {
  onBookTestDrive?: () => void;
  onOpenAdmin?: () => void;
}

export default function Navbar({ onBookTestDrive, onOpenAdmin }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { city, openLocationModal } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Buy Cars', href: '#popular-cars' },
    { label: 'Car Library', href: '#car-library' },
    { label: 'RTO Check', href: '#rto-check' },
    { label: 'Sell Your Car', href: '#sell-car' },
    { label: 'EMI Calculator', href: '#emi-calculator' },
    { label: 'Brands', href: '#brands' },
  ];

  const isDark = theme === 'dark';

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? isDark
              ? 'bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/8 shadow-2xl'
              : 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg'
            : isDark
            ? 'bg-transparent'
            : 'bg-white/60 backdrop-blur-md border-b border-gray-100'
        }`}
      >
        <div className="container-width">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo (Larger size) */}
            <motion.a
              href="#"
              className="flex items-center gap-2 group py-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Logo variant="auto" className="h-10 sm:h-12 md:h-13" showTagline />
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                    isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/8'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Location Selector (Interactive modal trigger) */}
              <motion.button
                type="button"
                onClick={openLocationModal}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  isDark
                    ? 'border-white/10 bg-white/5 hover:border-orange-500/60 hover:bg-orange-500/10 text-white'
                    : 'border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50 text-gray-800 shadow-sm'
                }`}
                title="Click to change your city"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="font-bold">{city}</span>
                <ChevronDown className="w-3 h-3 text-orange-400 flex-shrink-0" />
              </motion.button>

              {/* Book Test Drive Button (Prominent Highlight) */}
              <motion.button
                onClick={onBookTestDrive}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                <SteeringWheelIcon className="w-3.5 h-3.5" />
                <span>Book Test Drive</span>
              </motion.button>

              {/* Search Toggle */}
              <motion.button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  isDark ? 'text-white/75 hover:text-white hover:bg-white/8' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.9 }}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </motion.button>

              {/* Shortlist */}
              <motion.button
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative ${
                  isDark ? 'text-white/75 hover:text-white hover:bg-white/8' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.9 }}
                aria-label="Shortlist"
              >
                <Heart className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  2
                </span>
              </motion.button>

              {/* Theme Toggle (Light / Dark) */}
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-amber-400 hover:bg-white/10'
                    : 'border-gray-200 bg-gray-50 text-orange-600 hover:bg-gray-100 shadow-sm'
                }`}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
                )}
              </motion.button>

              {/* Sign In */}
              <motion.button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </motion.button>

              {/* Discreet Small Admin Portal Button */}
              <motion.button
                onClick={onOpenAdmin}
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${
                  isDark
                    ? 'border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/10 text-white/40 hover:text-orange-400'
                    : 'border-gray-200 bg-gray-100/80 hover:border-orange-400 text-gray-500 hover:text-orange-600'
                }`}
                title="Dealership Admin & CRM Portal"
                aria-label="Admin Portal"
              >
                <Shield className="w-2.5 h-2.5 text-orange-500" />
                <span>Admin</span>
              </motion.button>
            </div>

            {/* Mobile Actions: Test Drive + Theme Toggle + Menu */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onBookTestDrive}
                className="flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm"
              >
                <SteeringWheelIcon className="w-3 h-3" />
                <span>Drive</span>
              </button>

              <button
                onClick={toggleTheme}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-amber-400'
                    : 'border-gray-200 bg-gray-100 text-orange-600'
                }`}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                className={`w-9 h-9 flex items-center justify-center rounded-xl ${
                  isDark ? 'text-white bg-white/10' : 'text-gray-900 bg-gray-100'
                }`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`overflow-hidden border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
              >
                <div className="py-3 flex items-center gap-3">
                  <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for cars, brands, models..."
                    className={`flex-1 bg-transparent text-sm outline-none ${
                      isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className={isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden border-t overflow-hidden ${
                isDark ? 'bg-[#0c0d10]/95 backdrop-blur-xl border-white/10' : 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-xl'
              }`}
            >
              <div className="px-4 py-4 space-y-2">
                {/* Book Test Drive Highlight Button */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onBookTestDrive?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold text-sm shadow-md"
                >
                  <SteeringWheelIcon className="w-4 h-4" />
                  <span>Book Free Test Drive</span>
                </button>

                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark
                        ? 'text-white/80 hover:text-white hover:bg-white/8'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className={`pt-3 border-t flex flex-col gap-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openLocationModal();
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold border ${
                      isDark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>Location: {city}</span>
                    </div>
                    <span className="text-xs text-orange-500 font-bold">Change</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20">
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onOpenAdmin?.();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold ${
                      isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Shield className="w-3 h-3 text-orange-500" />
                    <span>Admin & CRM Portal</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
