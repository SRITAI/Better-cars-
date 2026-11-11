import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, X, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter admin PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Default passcode: admin123 or 1234
      if (pin === 'admin123' || pin === '1234' || pin === 'bettercars') {
        setIsLoading(false);
        setPin('');
        onSuccess();
      } else {
        setIsLoading(false);
        setError('Invalid PIN. Hint: Use default passcode "admin123"');
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
            isDark ? 'bg-[#101116] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">BetterCars Admin Portal</h3>
              <p className="text-xs text-gray-400">Inventory Management & CRM</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-500" />
                <span>Admin Passcode / PIN</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter passcode (default: admin123)"
                  autoFocus
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                    isDark
                      ? 'bg-white/5 border-white/15 focus:border-orange-500 text-white placeholder:text-white/30'
                      : 'bg-gray-50 border-gray-200 focus:border-orange-500 text-gray-900'
                  }`}
                />
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
            >
              <span>{isLoading ? 'Verifying...' : 'Access Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-gray-400 mt-4">
            Protected area for authorized dealership & sales executives.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
