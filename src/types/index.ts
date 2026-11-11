export interface CarSpecs {
  engine: string;
  power: string;
  torque: string;
  mileage: string;
  ownership: string;
  rto: string;
  insurance: string;
  fuelTank: string;
}

export interface InspectionCheck {
  category: string;
  passed: number;
  total: number;
  highlights: string[];
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  emi: number;
  km: number;
  fuel: string;
  transmission: string;
  image: string;
  gallery?: string[];
  badge?: string;
  rating?: number;
  color?: string;
  bodyType?: 'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'Coupe';
  specs?: CarSpecs;
  inspections?: InspectionCheck[];
}

export interface Testimonial {
  id: number;
  name: string;
  city: string;
  review: string;
  rating: number;
  avatar: string;
  car: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: 'Buying' | 'Selling' | 'Warranty' | 'Financing';
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
  count: number;
}

export interface BudgetCategory {
  id: number;
  label: string;
  min: number;
  max: number | null;
  image: string;
  count: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'favorite';
}

export interface FilterState {
  brand: string;
  model: string;
  priceRange: string;
  fuel: string;
  transmission: string;
  bodyType: string;
}
