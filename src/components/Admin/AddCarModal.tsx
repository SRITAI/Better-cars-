import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Car as CarIcon,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { addCarToInventory } from '../../services/adminService';
import type { Car } from '../../types';

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded: (newCar: Car) => void;
}

const BRANDS = [
  'Porsche',
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Hyundai',
  'Tata',
  'Toyota',
  'Mahindra',
  'Kia',
  'Honda',
  'Volkswagen',
  'Other',
];

const BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Coupe'] as const;
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'PDK Automatic', '7-Speed DCT', 'CVT'];

export default function AddCarModal({ isOpen, onClose, onCarAdded }: AddCarModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [brand, setBrand] = useState('Hyundai');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2023);
  const [price, setPrice] = useState<string>('1250000');
  const [emi, setEmi] = useState<string>('21500');
  const [km, setKm] = useState<string>('18000');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [bodyType, setBodyType] = useState<'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'Coupe'>('SUV');
  const [badge, setBadge] = useState('Verified Stock');
  const [color, setColor] = useState('#1e293b');

  // Specs
  const [engine, setEngine] = useState('1.5L Turbo GDi');
  const [power, setPower] = useState('160 PS');
  const [mileage, setMileage] = useState('18.0 kmpl');
  const [rto, setRto] = useState('DL-01 Delhi');

  // Image states
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local image file upload (converts to Base64 for instant display & storage)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file must be under 8MB');
      return;
    }

    setIsUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageUrl(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSampleImage = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setError('Please enter car model name');
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      setError('Please enter a valid selling price');
      return;
    }
    const finalImage =
      imagePreview ||
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80';

    setIsSubmitting(true);
    setError('');

    try {
      const added = await addCarToInventory({
        brand,
        model: model.trim(),
        year,
        price: numPrice,
        emi: Number(emi) || Math.round(numPrice / 60),
        km: Number(km) || 0,
        fuel,
        transmission,
        bodyType,
        badge,
        color,
        image: finalImage,
        gallery: galleryUrls.length > 0 ? galleryUrls : [finalImage],
        specs: {
          engine,
          power,
          mileage,
          rto,
          ownership: '1st Owner',
          insurance: 'Comprehensive Valid',
          torque: '250 Nm',
          fuelTank: '50 L',
        },
      });

      onCarAdded(added);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save car');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-3xl my-8 rounded-3xl p-6 sm:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#101117] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
                <CarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>Add New Car to Inventory</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live Sync
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Add vehicle specs, price, and upload showroom photos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl text-gray-400 hover:text-white transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Image Upload Section */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <label className="block text-xs font-bold uppercase tracking-wider text-orange-500 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Vehicle Cover Image & Photos</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    isDark
                      ? 'border-white/20 hover:border-orange-500 bg-white/5 hover:bg-orange-500/5'
                      : 'border-gray-300 hover:border-orange-500 bg-white hover:bg-orange-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold">{isUploading ? 'Processing Image...' : 'Click to Upload from Device'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP up to 8MB</p>
                </div>

                {/* Preview Box */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[160px] bg-black/40 flex items-center justify-center">
                  {imagePreview || imageUrl ? (
                    <img
                      src={imagePreview || imageUrl}
                      alt="Car Preview"
                      className="w-full h-40 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <p className="text-xs">Image preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Or paste Image URL */}
              <div className="mt-3">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Or paste external image URL (https://...)"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Sample Quick Images */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-gray-400">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80')}
                  className="text-[10px] px-2 py-0.5 rounded-lg border border-white/10 hover:border-orange-500"
                >
                  White SUV
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80')}
                  className="text-[10px] px-2 py-0.5 rounded-lg border border-white/10 hover:border-orange-500"
                >
                  Porsche Blue
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleImage('https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80')}
                  className="text-[10px] px-2 py-0.5 rounded-lg border border-white/10 hover:border-orange-500"
                >
                  BMW Sedan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeImg = imagePreview || imageUrl;
                    if (activeImg) setGalleryUrls((prev) => [...prev, activeImg]);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg border border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"
                >
                  + Add to Gallery ({galleryUrls.length})
                </button>
              </div>
            </div>

            {/* 2. Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Brand / Maker</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b} className={isDark ? 'bg-[#181920]' : ''}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Model & Variant *</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Creta SX(O) or 911 GT3"
                  required
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={2010}
                  max={2026}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Body Type</label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  {BODY_TYPES.map((t) => (
                    <option key={t} value={t} className={isDark ? 'bg-[#181920]' : ''}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Pricing & Kilometers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setEmi(String(Math.round(Number(e.target.value) / 60)));
                  }}
                  placeholder="e.g. 1250000"
                  required
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-bold text-orange-500 outline-none ${
                    isDark ? 'bg-white/5 border-white/15' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Estimated Monthly EMI (₹)</label>
                <input
                  type="number"
                  value={emi}
                  onChange={(e) => setEmi(e.target.value)}
                  placeholder="e.g. 21500"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Kilometers Driven (KM)</label>
                <input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="e.g. 18000"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* 4. Fuel & Transmission & Badge & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Fuel Type</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f} className={isDark ? 'bg-[#181920]' : ''}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  {TRANSMISSIONS.map((t) => (
                    <option key={t} value={t} className={isDark ? 'bg-[#181920]' : ''}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Badge Tag</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="Verified Stock">Verified Stock</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Hot Deal">Hot Deal</option>
                  <option value="Price Dropped">Price Dropped</option>
                  <option value="Supercar Certified">Supercar Certified</option>
                  <option value="Zero Emission">Zero Emission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Color Theme</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-white/15 bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 5. Key Tech Specs */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Specifications & RTO</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1">Engine</span>
                  <input
                    type="text"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1">Power</span>
                  <input
                    type="text"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1">Mileage</span>
                  <input
                    type="text"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block mb-1">RTO City</span>
                  <input
                    type="text"
                    value={rto}
                    onChange={(e) => setRto(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Car to Inventory'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
