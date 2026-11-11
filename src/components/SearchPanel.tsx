import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, SlidersHorizontal, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

const brands = [
  'All Brands',
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Honda',
  'Toyota',
  'Kia',
  'Volkswagen',
  'Porsche',
  'Audi',
  'BMW',
];
const models = [
  'All Models',
  '911 GT3 RS',
  'Creta',
  'Nexon',
  'Swift',
  'City',
  'Fortuner',
  'XUV700',
  'Seltos',
  'M4 Competition',
];
const fuels = ['All Fuels', 'Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
const transmissions = ['All Transmissions', 'Manual', 'Automatic', 'CVT', 'DCT', 'DSG'];
const priceRanges = [
  'Any Budget',
  'Under ₹5L',
  '₹5L – ₹10L',
  '₹10L – ₹20L',
  '₹20L – ₹50L',
  'Above ₹50L',
];
const quickCities = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
];

type DropdownProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
};

function Dropdown({ label, options, value, onChange, isDark }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 border px-4 py-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
          isDark
            ? 'bg-white/5 border-white/10 text-white hover:border-orange-500 hover:bg-white/8'
            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-orange-500 hover:bg-white'
        }`}
      >
        <span className="text-left truncate">{value || label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-orange-500' : isDark ? 'text-white/40' : 'text-gray-400'
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-2xl z-30 overflow-hidden max-h-52 overflow-y-auto ${
              isDark
                ? 'bg-[#181920] border-white/15 text-white shadow-black/80'
                : 'bg-white border-gray-100 text-gray-900 shadow-xl'
            }`}
          >
            {options.map((opt) => {
              const isDefault = opt.startsWith('All ') || opt.startsWith('Any ');
              const isSelected = value === opt || (!value && isDefault);

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(isDefault ? '' : opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold'
                      : isDark
                      ? 'text-white/80 hover:bg-white/8 hover:text-orange-400'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function SearchPanel() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { city, setCity, openLocationModal } = useLocation();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  return (
    <section className="relative z-10 pt-10 pb-16">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`rounded-3xl shadow-2xl p-6 md:p-8 border transition-all ${
            isDark
              ? 'bg-[#111218] border-white/10 shadow-black/60'
              : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-600'
              }`}>
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Search Certified Cars
                </h2>
                <p className={`text-xs ${isDark ? 'text-white/45' : 'text-gray-400'}`}>
                  Filter from 10,000+ verified pre-owned cars in{' '}
                  <button
                    type="button"
                    onClick={openLocationModal}
                    className="text-orange-500 font-bold hover:underline cursor-pointer"
                  >
                    {city} 📍
                  </button>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openLocationModal}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                isDark
                  ? 'bg-orange-500/10 border-orange-500/25 text-orange-400 hover:bg-orange-500/20'
                  : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
              }`}
              title="Click to switch city"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Location: {city}</span>
              <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                Change
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <Dropdown label="Brand" options={brands} value={brand} onChange={setBrand} isDark={isDark} />
            <Dropdown label="Model" options={models} value={model} onChange={setModel} isDark={isDark} />
            <Dropdown label="Budget" options={priceRanges} value={price} onChange={setPrice} isDark={isDark} />
            <Dropdown label="Fuel Type" options={fuels} value={fuel} onChange={setFuel} isDark={isDark} />
            <Dropdown label="Transmission" options={transmissions} value={transmission} onChange={setTransmission} isDark={isDark} />
            
            {/* Location Selector Field */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className={`w-full flex items-center justify-between gap-1.5 border px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isDark
                    ? 'bg-white/5 border-orange-500/30 text-white hover:border-orange-500 hover:bg-white/8'
                    : 'bg-orange-50/50 border-orange-200 text-gray-800 hover:border-orange-500 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span className="truncate font-bold">{city}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                    locationDropdownOpen ? 'rotate-180 text-orange-500' : isDark ? 'text-white/40' : 'text-gray-400'
                  }`}
                />
              </button>

              {locationDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setLocationDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-2xl z-30 overflow-hidden max-h-60 overflow-y-auto ${
                      isDark
                        ? 'bg-[#181920] border-white/15 text-white shadow-black/80'
                        : 'bg-white border-gray-100 text-gray-900 shadow-xl'
                    }`}
                  >
                    {/* Top Action to Open Full Modal */}
                    <button
                      type="button"
                      onClick={() => {
                        setLocationDropdownOpen(false);
                        openLocationModal();
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 border-b border-orange-500/20 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Browse All 20+ Cities...
                      </span>
                      <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded">More</span>
                    </button>

                    {quickCities.map((c) => {
                      const isSelected = city.toLowerCase() === c.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCity(c);
                            setLocationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500 text-white font-bold'
                              : isDark
                              ? 'text-white/80 hover:bg-white/8 hover:text-orange-400'
                              : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setBrand('');
                setModel('');
                setPrice('');
                setFuel('');
                setTransmission('');
              }}
              className={`text-xs transition-colors underline-offset-2 hover:underline cursor-pointer ${
                isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Reset all filters
            </button>
            <motion.a
              href="#popular-cars"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25"
            >
              <Search className="w-4 h-4" />
              <span>Search Cars</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
