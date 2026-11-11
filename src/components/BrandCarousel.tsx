import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { brands } from '../data/mockData';

const brandColors: Record<string, string> = {
  'Maruti Suzuki': '#005CAB',
  'Hyundai': '#002C5F',
  'Tata': '#1F3A93',
  'Honda': '#CC0000',
  'Toyota': '#EB0A1E',
  'Mahindra': '#CC1100',
  'Kia': '#05141F',
  'Volkswagen': '#001E50',
  'Skoda': '#4BA82E',
  'Ford': '#003178',
};

const brandInitials: Record<string, string> = {
  'Maruti Suzuki': 'MS',
  'Hyundai': 'H',
  'Tata': 'T',
  'Honda': 'Ho',
  'Toyota': 'T',
  'Mahindra': 'M',
  'Kia': 'K',
  'Volkswagen': 'VW',
  'Skoda': 'Sk',
  'Ford': 'F',
};

export default function BrandCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section id="brands" className="section-padding bg-gray-50">
      <div className="container-width">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
              Explore by Make
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Popular Certified Brands
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500 flex items-center justify-center transition-all shadow-sm"
              aria-label="Previous brands"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-orange-500 hover:text-orange-500 flex items-center justify-center transition-all shadow-sm"
              aria-label="Next brands"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
        >
          {brands.map((brand, i) => (
            <motion.a
              key={brand.id}
              href="#popular-cars"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center gap-3 p-5 w-36 bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all group cursor-pointer"
            >
              {/* Brand Logo Circle */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: brandColors[brand.name] || '#1a1a1a' }}
              >
                {brandInitials[brand.name] || brand.name[0]}
              </div>

              <div className="text-center">
                <p className="text-gray-900 font-semibold text-sm leading-tight group-hover:text-orange-600 transition-colors">
                  {brand.name}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{brand.count.toLocaleString()} cars</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
