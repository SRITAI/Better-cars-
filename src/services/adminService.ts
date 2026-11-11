import { supabase } from '../lib/supabase';
import type { Car } from '../types';
import { featuredCars as initialFeatured, popularCars as initialPopular } from '../data/mockData';

export interface CRMLead {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  city?: string;
  car_interested?: string;
  budget?: number;
  lead_source: 'Website' | 'Test Drive' | 'Sell Car' | 'Walk-in' | 'Phone';
  stage: 'new' | 'contacted' | 'test_drive_scheduled' | 'negotiation' | 'won' | 'lost';
  priority: 'hot' | 'warm' | 'cold';
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CustomerSignup {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  interested_in: 'buy' | 'sell' | 'finance' | 'general';
  created_at: string;
}

export interface TestDriveRecord {
  id: string;
  car_id?: number | string | null;
  car_name: string;
  drive_mode: string;
  hub_location?: string;
  doorstep_address?: string;
  drive_date: string;
  drive_time_slot: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  created_at: string;
}

export interface SellInquiryRecord {
  id: string;
  registration_number: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  km_driven: number;
  ownership: string;
  condition: string;
  estimated_min_price: number;
  estimated_max_price: number;
  seller_name?: string;
  seller_phone?: string;
  seller_city?: string;
  rto_verified: boolean;
  status: string;
  created_at: string;
}

// Fallback initial CRM leads
const DEFAULT_LEADS: CRMLead[] = [
  {
    id: 'lead-1',
    customer_name: 'Vikramaditya Sharma',
    customer_phone: '+91 98112 34567',
    customer_email: 'vikram.sharma@gmail.com',
    city: 'Delhi NCR',
    car_interested: '2023 Hyundai Creta SX(O)',
    budget: 1450000,
    lead_source: 'Website',
    stage: 'new',
    priority: 'hot',
    assigned_to: 'Aman Verma',
    notes: 'Looking for immediate purchase within 3 days. Ready with downpayment.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'lead-2',
    customer_name: 'Priya Sundaram',
    customer_phone: '+91 98450 12345',
    customer_email: 'priya.s@outlook.com',
    city: 'Bengaluru',
    car_interested: '2022 Honda City ZX',
    budget: 1100000,
    lead_source: 'Test Drive',
    stage: 'contacted',
    priority: 'warm',
    assigned_to: 'Rohan Mehta',
    notes: 'Test drive requested for White color model. Prefers weekend slots.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'lead-3',
    customer_name: 'Rajesh Malhotra',
    customer_phone: '+91 98200 98765',
    customer_email: 'rajesh.malhotra@yahoo.com',
    city: 'Mumbai',
    car_interested: '2023 Tata Nexon EV Max',
    budget: 1600000,
    lead_source: 'Website',
    stage: 'test_drive_scheduled',
    priority: 'hot',
    assigned_to: 'Simran Kaur',
    notes: 'Home test drive booked for Saturday 11:00 AM in Bandra.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'lead-4',
    customer_name: 'Ananya Deshmukh',
    customer_phone: '+91 97654 32109',
    customer_email: 'ananya.d@gmail.com',
    city: 'Pune',
    car_interested: '2021 Toyota Fortuner 4x4',
    budget: 3200000,
    lead_source: 'Walk-in',
    stage: 'negotiation',
    priority: 'hot',
    assigned_to: 'Aman Verma',
    notes: 'Loan pre-approved via HDFC Bank. Discussing final on-road price & warranty.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'lead-5',
    customer_name: 'Kunal Singhania',
    customer_phone: '+91 99887 65432',
    customer_email: 'kunal.singhania@gmail.com',
    city: 'Gurugram',
    car_interested: '2023 Mahindra XUV700 AX7L',
    budget: 2150000,
    lead_source: 'Sell Car',
    stage: 'won',
    priority: 'warm',
    assigned_to: 'Rohan Mehta',
    notes: 'Exchanged previous Swift Dzire, received same-day payment and booked XUV700.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

// Fallback initial Customer Signups
const DEFAULT_CUSTOMERS: CustomerSignup[] = [
  {
    id: 'cust-1',
    name: 'Rahul Kulkarni',
    phone: '+91 98210 11223',
    email: 'rahul.kulkarni@gmail.com',
    city: 'Mumbai',
    interested_in: 'buy',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Sneha Agarwal',
    phone: '+91 98101 44556',
    email: 'sneha.agarwal@gmail.com',
    city: 'Delhi NCR',
    interested_in: 'finance',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Amit Patel',
    phone: '+91 98790 77889',
    email: 'amit.patel@gmail.com',
    city: 'Ahmedabad',
    interested_in: 'sell',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

// Local storage keys
const LOCAL_LEADS_KEY = 'bettercars_crm_leads';
const LOCAL_CUSTOMERS_KEY = 'bettercars_customers';
const LOCAL_CARS_KEY = 'bettercars_added_cars';

/**
 * Fetch all CRM leads from Supabase with localStorage backup
 */
export async function getCRMLeads(): Promise<CRMLead[]> {
  try {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(data));
      return data as CRMLead[];
    }
  } catch (err) {
    console.warn('Supabase getCRMLeads error, falling back to local storage:', err);
  }

  // Fallback
  const cached = localStorage.getItem(LOCAL_LEADS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(DEFAULT_LEADS));
  return DEFAULT_LEADS;
}

/**
 * Create a new CRM lead
 */
export async function createCRMLead(lead: Omit<CRMLead, 'id' | 'created_at'>): Promise<CRMLead> {
  const newLead: CRMLead = {
    ...lead,
    id: 'lead-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('crm_leads')
      .insert([lead])
      .select('*')
      .maybeSingle();

    if (!error && data) {
      newLead.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase createCRMLead error:', err);
  }

  // Update local
  const current = await getCRMLeads();
  const updated = [newLead, ...current.filter((l) => l.id !== newLead.id)];
  localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(updated));
  return newLead;
}

/**
 * Update CRM lead stage or details
 */
export async function updateCRMLead(
  id: string,
  updates: Partial<CRMLead>
): Promise<CRMLead | null> {
  const timestamp = new Date().toISOString();

  try {
    await supabase
      .from('crm_leads')
      .update({ ...updates, updated_at: timestamp })
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase updateCRMLead error:', err);
  }

  const current = await getCRMLeads();
  const index = current.findIndex((l) => l.id === id);
  if (index !== -1) {
    const updated = { ...current[index], ...updates, updated_at: timestamp };
    current[index] = updated;
    localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(current));
    return updated;
  }
  return null;
}

/**
 * Delete a CRM lead
 */
export async function deleteCRMLead(id: string): Promise<boolean> {
  try {
    await supabase.from('crm_leads').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase deleteCRMLead error:', err);
  }

  const current = await getCRMLeads();
  const filtered = current.filter((l) => l.id !== id);
  localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Fetch Customer Signups
 */
export async function getCustomerSignups(): Promise<CustomerSignup[]> {
  try {
    const { data, error } = await supabase
      .from('customer_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(data));
      return data as CustomerSignup[];
    }
  } catch (err) {
    console.warn('Supabase getCustomerSignups error:', err);
  }

  const cached = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
  return DEFAULT_CUSTOMERS;
}

/**
 * Add a new Customer Signup
 */
export async function addCustomerSignup(
  customer: Omit<CustomerSignup, 'id' | 'created_at'>
): Promise<CustomerSignup> {
  const newCust: CustomerSignup = {
    ...customer,
    id: 'cust-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('customer_signups')
      .insert([customer])
      .select('*')
      .maybeSingle();

    if (!error && data) {
      newCust.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase addCustomerSignup error:', err);
  }

  const current = await getCustomerSignups();
  const updated = [newCust, ...current];
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(updated));
  return newCust;
}

/**
 * Fetch Test Drive Bookings from Supabase
 */
export async function getTestDriveBookings(): Promise<TestDriveRecord[]> {
  try {
    const { data, error } = await supabase
      .from('test_drive_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as TestDriveRecord[];
    }
  } catch (err) {
    console.warn('Supabase getTestDriveBookings error:', err);
  }
  return [];
}

/**
 * Fetch Sell Car Inquiries from Supabase
 */
export async function getSellCarInquiries(): Promise<SellInquiryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('sell_car_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as SellInquiryRecord[];
    }
  } catch (err) {
    console.warn('Supabase getSellCarInquiries error:', err);
  }
  return [];
}

/**
 * Inventory: Get all cars (Mock Cars + Supabase inventory_cars + LocalStorage cars)
 */
export async function getAllInventoryCars(): Promise<Car[]> {
  const baseCars: Car[] = [...initialFeatured, ...initialPopular];

  try {
    const { data, error } = await supabase
      .from('inventory_cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const dbCars: Car[] = data.map((d: any) => ({
        id: typeof d.id === 'number' ? d.id : Math.abs(parseInt(d.id.replace(/[^0-9]/g, '').slice(0, 8), 10) || Date.now()),
        brand: d.brand,
        model: d.model,
        year: d.year,
        price: Number(d.price),
        emi: d.emi ? Number(d.emi) : Math.round(Number(d.price) / 60),
        km: Number(d.km) || 0,
        fuel: d.fuel,
        transmission: d.transmission,
        image: d.image,
        gallery: d.gallery || [],
        badge: d.badge || 'New Arrival',
        rating: Number(d.rating) || 4.9,
        color: d.color,
        bodyType: d.body_type,
        specs: d.specs || undefined,
      }));

      return [...dbCars, ...baseCars];
    }
  } catch (err) {
    console.warn('Supabase getAllInventoryCars error:', err);
  }

  // Local storage check
  const localSaved = localStorage.getItem(LOCAL_CARS_KEY);
  if (localSaved) {
    try {
      const parsed: Car[] = JSON.parse(localSaved);
      return [...parsed, ...baseCars];
    } catch {
      // ignore
    }
  }

  return baseCars;
}

/**
 * Add a new Car to inventory
 */
export async function addCarToInventory(carData: {
  brand: string;
  model: string;
  year: number;
  price: number;
  emi?: number;
  km: number;
  fuel: string;
  transmission: string;
  image: string;
  gallery?: string[];
  badge?: string;
  color?: string;
  bodyType?: 'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'Coupe';
  specs?: any;
}): Promise<Car> {
  const newId = Date.now();
  const emiCalculated = carData.emi || Math.round(carData.price / 60);

  const newCar: Car = {
    id: newId,
    brand: carData.brand,
    model: carData.model,
    year: carData.year,
    price: carData.price,
    emi: emiCalculated,
    km: carData.km,
    fuel: carData.fuel,
    transmission: carData.transmission,
    image: carData.image,
    gallery: carData.gallery || [carData.image],
    badge: carData.badge || 'Verified Stock',
    rating: 4.9,
    color: carData.color || '#1A1A1A',
    bodyType: carData.bodyType || 'SUV',
    specs: carData.specs,
  };

  try {
    await supabase.from('inventory_cars').insert([
      {
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        emi: emiCalculated,
        km: carData.km,
        fuel: carData.fuel,
        transmission: carData.transmission,
        image: carData.image,
        gallery: carData.gallery || [carData.image],
        badge: carData.badge || 'Verified Stock',
        rating: 4.9,
        color: carData.color || '#1A1A1A',
        body_type: carData.bodyType || 'SUV',
        specs: carData.specs || {},
      },
    ]);
  } catch (err) {
    console.warn('Supabase addCarToInventory error:', err);
  }

  // Update local storage
  const current = localStorage.getItem(LOCAL_CARS_KEY);
  const list: Car[] = current ? JSON.parse(current) : [];
  list.unshift(newCar);
  localStorage.setItem(LOCAL_CARS_KEY, JSON.stringify(list));

  return newCar;
}
