import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

export default function Testimonials() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      className={`section-padding relative overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#08090b] text-white' : 'bg-slate-50 text-gray-900'
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

      <div className="container-width relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
            Verified Experiences
          </p>
          <h2 className={`text-3xl md:text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Real stories, real delight
          </h2>
        </motion.div>

        {/* Main Testimonial Card */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className={`rounded-3xl p-8 md:p-12 relative border transition-all ${
                isDark
                  ? 'glass border-white/10'
                  : 'bg-white border-gray-100 shadow-xl'
              }`}
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-8 w-12 h-12 text-orange-500/10 fill-orange-500/10" />

              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonials[active].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className={`text-base md:text-lg leading-relaxed mb-8 font-light italic ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                "{testimonials[active].review}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={testimonials[active].avatar}
                    alt={testimonials[active].name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-500/40"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                </div>
                <div>
                  <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonials[active].name}</p>
                  <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{testimonials[active].city}</p>
                  <p className="text-orange-500 text-xs font-semibold mt-0.5">{testimonials[active].car}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/50 text-white/60 hover:text-white'
                  : 'border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-400 text-gray-600 shadow-sm'
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 h-2 bg-orange-500' : isDark ? 'w-2 h-2 bg-white/20 hover:bg-white/40' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/50 text-white/60 hover:text-white'
                  : 'border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-400 text-gray-600 shadow-sm'
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Avatar Thumbnails Row */}
        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.id}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.1 }}
              className={`relative transition-all duration-300 ${i === active ? 'scale-110' : 'opacity-40 hover:opacity-75'}`}
              aria-label={`View ${t.name}'s review`}
            >
              <img
                src={t.avatar}
                alt={t.name}
                className={`w-10 h-10 rounded-full object-cover border-2 transition-all ${
                  i === active ? 'border-orange-500' : 'border-transparent'
                }`}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
