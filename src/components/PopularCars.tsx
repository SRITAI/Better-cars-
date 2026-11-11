import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Gauge, Fuel, ArrowRight, Star, MapPin } from 'lucide-react';
import SteeringWheelIcon from './SteeringWheelIcon';
import type { Car } from '../types';
import { popularCars } from '../data/mockData';
import { useLocation } from '../context/LocationContext';
import { getAllInventoryCars } from '../services/adminService';

const formatPrice = (p: number) =>
  p >= 10000000
    ? `₹${(p / 10000000).toFixed(2)} Cr`
    : p >= 100000
    ? `₹${(p / 100000).toFixed(2)} Lakh`
    : `₹${p.toLocaleString('en-IN')}`;

interface PopularCarsProps {
  onBookTestDrive?: (car: Car) => void;
}

function CarCard({ car, index, onBookTestDrive }: { car: Car; index: number; onBookTestDrive?: (car: Car) => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover group"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {car.badge && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {car.badge}
            </span>
          )}
        </div>

        {/* Shortlist heart button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-md ${
            liked
              ? 'bg-red-500 text-white shadow-red-200'
              : 'bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">{car.brand}</p>
            <h3 className="text-gray-900 font-bold text-base leading-tight">{car.model}</h3>
          </div>
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold text-amber-700">4.9</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2 mt-3 mb-4 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <Gauge className="w-3 h-3 text-orange-500" />
            {(car.km / 1000).toFixed(0)}k km
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            <Fuel className="w-3 h-3 text-orange-500" />
            {car.fuel}
          </span>
          <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            {car.transmission}
          </span>
          <span className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            {car.year}
          </span>
        </div>

        {/* Price & View / Test Drive Actions */}
        <div className="border-t border-gray-100 pt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-orange-600 font-black text-xl">{formatPrice(car.price)}</p>
            <p className="text-xs text-gray-400 mt-0.5">EMI ₹{car.emi.toLocaleString('en-IN')}/mo</p>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              onClick={() => onBookTestDrive?.(car)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20"
              title={`Book test drive for ${car.brand} ${car.model}`}
            >
              <SteeringWheelIcon className="w-3 h-3" />
              <span>Test Drive</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PopularCars({ onBookTestDrive }: PopularCarsProps = {}) {
  const [showAll, setShowAll] = useState(false);
  const { city, openLocationModal } = useLocation();
  const [allCarsList, setAllCarsList] = useState<Car[]>(popularCars);

  useEffect(() => {
    getAllInventoryCars().then((res) => {
      if (res && res.length > 0) {
        setAllCarsList(res);
      }
    });
  }, []);

  const displayedCars = showAll ? allCarsList : allCarsList.slice(0, 6);

  return (
    <section id="popular-cars" className="section-padding bg-gray-50">
      <div className="container-width">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                Verified Stock
              </p>
              <button
                type="button"
                onClick={openLocationModal}
                className="text-xs bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-600 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Change location"
              >
                <MapPin className="w-3 h-3 text-orange-500" />
                <span>{city} Hub · Change</span>
              </button>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Popular Certified Cars in {city}
            </h2>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors"
          >
            {showAll ? 'Show Fewer Cars' : 'View All Available Cars'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCars.map((car, i) => (
            <CarCard key={car.id} car={car} index={i} onBookTestDrive={onBookTestDrive} />
          ))}
        </div>

        {/* Load More Button */}
        {!showAll && popularCars.length > 6 && (
          <div className="text-center mt-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAll(true)}
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all shadow-sm"
            >
              Load More Certified Cars
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
