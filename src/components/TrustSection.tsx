import { motion } from 'framer-motion';
import { Shield, Award, RefreshCw, Eye, CheckCircle2, Truck } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fast Doorstep Delivery',
    description: 'Your chosen vehicle is delivered directly to your doorstep with a seamless white-glove handoff experience.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: Shield,
    title: '1-Year Comprehensive Warranty',
    description: 'Complete mechanical and electrical protection covering engine, transmission, steering, and AC systems.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: RefreshCw,
    title: '5-Day Money-Back Guarantee',
    description: "Didn't love your car? Return it within 5 days or 500 km for a 100% full refund with zero questions asked.",
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Eye,
    title: 'Fixed & Transparent Pricing',
    description: 'No hidden dealership charges, surprise documentation fees, or negotiation headaches. The price you see is final.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: Award,
    title: 'Hand-Picked Premium Catalog',
    description: 'Curated premium vehicles with verified ownership history, genuine meters, and spotless accident-free records.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: CheckCircle2,
    title: 'Free Doorstep Test Drive',
    description: 'Book a free test drive online. Our relationship executive brings the vehicle directly to your home or office.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
];

const stats = [
  { label: 'Cars Delivered', value: '45,000+' },
  { label: 'Happy Families', value: '42,000+' },
  { label: 'Active Cities', value: '25+' },
  { label: 'Google Rating', value: '4.9 / 5' },
];

export default function TrustSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-width">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
            The BetterCars Promise
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Because everyone deserves peace of mind
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Every policy, warranty, and buyer guarantee at BetterCars is designed to protect your hard-earned investment.
          </p>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 rounded-2xl p-6 text-center text-white shadow-xl shadow-orange-500/20"
            >
              <p className="text-3xl sm:text-4xl font-black mb-1">{stat.value}</p>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className={`border ${feature.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-orange-200`}
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
