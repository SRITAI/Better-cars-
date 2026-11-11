import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchPanel from './components/SearchPanel';
import RTOCarCheck from './components/RTOCarCheck';
import PopularCars from './components/PopularCars';
import UsedCarFinanceCalculator from './components/UsedCarFinanceCalculator';
import TrustSection from './components/TrustSection';
import SellCar from './components/SellCar';
import BrandCarousel from './components/BrandCarousel';
import BudgetSection from './components/BudgetSection';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import BookTestDriveModal from './components/BookTestDriveModal';
import LocationModal from './components/LocationModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import type { Car } from './types';
import type { RTOVehicle } from './services/rtoService';

function MainContent() {
  const { theme } = useTheme();

  // Global Test Drive Modal State
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [testDriveCar, setTestDriveCar] = useState<Car | null>(null);

  // Cross-component RTO to Sell Car state
  const [selectedRTOVehicle, setSelectedRTOVehicle] = useState<RTOVehicle | null>(null);

  const handleOpenTestDrive = (car?: Car) => {
    if (car) {
      setTestDriveCar(car);
    }
    setTestDriveOpen(true);
  };

  const handleSellThisCar = (vehicle: RTOVehicle) => {
    setSelectedRTOVehicle(vehicle);
    const el = document.getElementById('sell-car');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#070708] text-white' : 'bg-white text-gray-900'
    }`}>
      <Navbar onBookTestDrive={() => handleOpenTestDrive()} />
      <main>
        <HeroCarousel onBookTestDrive={handleOpenTestDrive} />
        <SearchPanel />
        <RTOCarCheck onSellThisCar={handleSellThisCar} />
        <PopularCars onBookTestDrive={handleOpenTestDrive} />
        <UsedCarFinanceCalculator onBookTestDrive={handleOpenTestDrive} />
        <TrustSection />
        <SellCar initialRTOVehicle={selectedRTOVehicle} />
        <BrandCarousel />
        <BudgetSection />
        <Testimonials />
        <FAQSection />
      </main>
      <Footer />

      {/* Universal Book Test Drive Modal */}
      <BookTestDriveModal
        isOpen={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        preSelectedCar={testDriveCar}
      />

      {/* Universal Location / City Selector Modal */}
      <LocationModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <MainContent />
      </LocationProvider>
    </ThemeProvider>
  );
}
