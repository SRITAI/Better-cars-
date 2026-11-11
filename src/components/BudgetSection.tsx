import { motion } from 'framer-motion';
import { budgetCategories } from '../data/mockData';

export default function BudgetSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-width">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
            Every Budget Catered For
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Explore Cars by Budget
          </h2>
        </motion.div>

        {/* Budget Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {budgetCategories.map((cat, i) => (
            <motion.a
              key={cat.id}
              href="#popular-cars"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="relative group overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer text-left block shadow-sm hover:shadow-xl transition-all"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Orange tint on hover */}
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/15 transition-all duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-black text-lg leading-tight mb-1">{cat.label}</p>
                <p className="text-white/60 text-xs">{cat.count.toLocaleString()} cars available</p>

                {/* Orange indicator bar */}
                <div className="mt-3 w-8 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300 ease-out rounded-full" />
              </div>

              {/* Top badge */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                <p className="text-white text-[10px] font-semibold">{cat.count.toLocaleString()}+</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
