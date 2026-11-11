import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  city: string;
  setCity: (city: string) => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType>({
  city: 'Mumbai',
  setCity: () => {},
  isLocationModalOpen: false,
  openLocationModal: () => {},
  closeLocationModal: () => {},
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city, setCityState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bettercars-city');
      return saved && saved.trim() ? saved : 'Mumbai';
    } catch {
      return 'Mumbai';
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const setCity = (newCity: string) => {
    const formatted = newCity.trim() || 'Mumbai';
    setCityState(formatted);
    try {
      localStorage.setItem('bettercars-city', formatted);
    } catch {
      // ignore
    }
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  // Prevent background scroll when modal is active
  useEffect(() => {
    if (isLocationModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocationModalOpen]);

  return (
    <LocationContext.Provider
      value={{
        city,
        setCity,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
