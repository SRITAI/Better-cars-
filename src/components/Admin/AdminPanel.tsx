import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Car as CarIcon,
  Users,
  Kanban,
  ClipboardList,
  PhoneCall,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  LogOut,
  Sparkles,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  getCRMLeads,
  updateCRMLead,
  deleteCRMLead,
  getAllInventoryCars,
  getTestDriveBookings,
  getSellCarInquiries,
  getCustomerSignups,
  addCustomerSignup,
  type CRMLead,
  type TestDriveRecord,
  type SellInquiryRecord,
  type CustomerSignup,
} from '../../services/adminService';
import type { Car } from '../../types';
import AddCarModal from './AddCarModal';
import AddLeadModal from './AddLeadModal';

interface AdminPanelProps {
  onClose: () => void;
}

const STAGES: { key: CRMLead['stage']; label: string; color: string; badgeBg: string }[] = [
  { key: 'new', label: 'New Inquiries', color: 'border-blue-500', badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { key: 'contacted', label: 'Contacted', color: 'border-amber-500', badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { key: 'test_drive_scheduled', label: 'Test Drive Scheduled', color: 'border-purple-500', badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { key: 'negotiation', label: 'Negotiation / Loan', color: 'border-orange-500', badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  { key: 'won', label: 'Deal Won (Sold)', color: 'border-emerald-500', badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { key: 'lost', label: 'Lost / Closed', color: 'border-gray-500', badgeBg: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
];

function formatPriceINR(val?: number) {
  if (!val) return '₹--';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'crm' | 'testdrives' | 'sellinquiries' | 'customers'>('overview');

  // Data states
  const [cars, setCars] = useState<Car[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRecord[]>([]);
  const [sellInquiries, setSellInquiries] = useState<SellInquiryRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerSignup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newCustModal, setNewCustModal] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', phone: '', email: '', city: 'Delhi NCR', interested_in: 'buy' as const });

  // Filter/Search states
  const [carSearch, setCarSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fetchedCars, fetchedLeads, fetchedTD, fetchedSell, fetchedCust] = await Promise.all([
        getAllInventoryCars(),
        getCRMLeads(),
        getTestDriveBookings(),
        getSellCarInquiries(),
        getCustomerSignups(),
      ]);

      setCars(fetchedCars);
      setLeads(fetchedLeads);
      setTestDrives(fetchedTD);
      setSellInquiries(fetchedSell);
      setCustomers(fetchedCust);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update lead stage
  const handleStageChange = async (leadId: string, newStage: CRMLead['stage']) => {
    const updated = await updateCRMLead(leadId, { stage: newStage });
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this CRM lead?')) {
      await deleteCRMLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }
  };

  // Convert Test Drive to CRM Lead
  const handleConvertTDToLead = async (td: TestDriveRecord) => {
    const newLead: Omit<CRMLead, 'id' | 'created_at'> = {
      customer_name: td.customer_name,
      customer_phone: td.customer_phone,
      car_interested: td.car_name,
      city: td.hub_location || 'Customer City',
      lead_source: 'Test Drive',
      stage: 'test_drive_scheduled',
      priority: 'hot',
      assigned_to: 'Sales Team',
      notes: `Test Drive scheduled for ${td.drive_date} (${td.drive_time_slot}) via ${td.drive_mode}.`,
    };
    // Import and create
    const { createCRMLead } = await import('../../services/adminService');
    const created = await createCRMLead(newLead);
    setLeads((prev) => [created, ...prev]);
    setActiveTab('crm');
  };

  // Convert Sell Inquiry to CRM Lead
  const handleConvertSellToLead = async (inq: SellInquiryRecord) => {
    const { createCRMLead } = await import('../../services/adminService');
    const created = await createCRMLead({
      customer_name: inq.seller_name || `Seller (${inq.registration_number})`,
      customer_phone: inq.seller_phone || '9999999999',
      car_interested: `Sell: ${inq.year} ${inq.brand} ${inq.model}`,
      budget: inq.estimated_max_price,
      city: inq.seller_city || 'India',
      lead_source: 'Sell Car',
      stage: 'new',
      priority: 'hot',
      assigned_to: 'Evaluations Team',
      notes: `Plate: ${inq.registration_number}, Fuel: ${inq.fuel_type}, Km: ${inq.km_driven}, Valuation: ₹${inq.estimated_min_price} - ₹${inq.estimated_max_price}`,
    });
    setLeads((prev) => [created, ...prev]);
    setActiveTab('crm');
  };

  // Add customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone) return;
    const added = await addCustomerSignup(custForm);
    setCustomers((prev) => [added, ...prev]);
    setNewCustModal(false);
    setCustForm({ name: '', phone: '', email: '', city: 'Delhi NCR', interested_in: 'buy' });
  };

  // KPI calculations
  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.budget || 0), 0);
  const hotLeadsCount = leads.filter((l) => l.priority === 'hot').length;
  const wonDealsCount = leads.filter((l) => l.stage === 'won').length;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#09090d] text-white' : 'bg-slate-50 text-gray-900'
    }`}>
      {/* Top Admin Navbar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl px-4 sm:px-6 py-3.5 flex items-center justify-between ${
        isDark ? 'bg-[#0f1015]/90 border-white/10' : 'bg-white/95 border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-orange-500/20">
            BC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight">BetterCars Admin & CRM</h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Live
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Dealership Inventory, Lead Pipeline & Customer Relations</p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            title="Refresh Data"
            className={`p-2 rounded-xl text-gray-400 hover:text-white transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddCarOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-orange-500" />
            <span>Add Car</span>
          </button>

          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>

          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
                : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Website</span>
          </button>
        </div>
      </header>

      {/* Main Admin Navigation Tabs */}
      <div className={`border-b px-4 sm:px-6 overflow-x-auto ${isDark ? 'border-white/10 bg-[#0d0e13]' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-2 py-2 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: undefined },
            { id: 'crm', label: 'CRM Pipeline', icon: Kanban, count: leads.length },
            { id: 'cars', label: 'Car Inventory', icon: CarIcon, count: cars.length },
            { id: 'testdrives', label: 'Test Drive Bookings', icon: ClipboardList, count: testDrives.length },
            { id: 'sellinquiries', label: 'Sell Inquiries', icon: DollarSign, count: sellInquiries.length },
            { id: 'customers', label: 'Customer Signups', icon: Users, count: customers.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm'
                    : isDark
                    ? 'text-white/60 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      active ? 'bg-black/25 text-white' : isDark ? 'bg-white/10 text-white/70' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Inventory</span>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center">
                    <CarIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold">{cars.length}</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-semibold">+ Live Showroom</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">CRM Pipeline</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold">{leads.length}</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="text-orange-400 font-semibold">{hotLeadsCount} Hot Inquiries</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Test Drives</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold">{testDrives.length}</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="text-purple-400 font-semibold">Flagship + Doorstep</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pipeline Value</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {formatPriceINR(totalPipelineValue)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-semibold">{wonDealsCount} Closed Won</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Leads Feed */}
              <div className={`lg:col-span-2 p-5 rounded-2xl border ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm">Recent CRM Leads & Follow-ups</h3>
                    <p className="text-xs text-gray-400">Direct inquiries from buyers and test-drive bookers</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('crm')}
                    className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1"
                  >
                    <span>View Kanban Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {leads.slice(0, 4).map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDark ? 'bg-white/5 border-white/8 hover:border-white/15' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{lead.customer_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            lead.priority === 'hot'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : lead.priority === 'warm'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {lead.priority}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">({lead.city})</span>
                        </div>
                        <p className="text-xs text-gray-300">
                          Interested in: <span className="font-semibold text-white">{lead.car_interested}</span> • Budget: <span className="text-orange-400 font-semibold">{formatPriceINR(lead.budget)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/${lead.customer_phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.customer_name)},%20thank%20you%20for%20contacting%20BetterCars!`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${lead.customer_phone}`}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-4">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="font-bold text-sm mb-3">Quick Dealership Actions</h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setIsAddCarOpen(true)}
                      className="w-full py-2.5 px-3.5 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CarIcon className="w-4 h-4" />
                        <span>Add New Car to Website</span>
                      </div>
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsAddLeadOpen(true)}
                      className="w-full py-2.5 px-3.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>Record Walk-in / Phone Lead</span>
                      </div>
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('testdrives')}
                      className="w-full py-2.5 px-3.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-purple-400" />
                        <span>Manage Test Drive Bookings</span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs ${isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>Real-Time Database Sync</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Cars added here immediately appear in the live inventory catalog. All inquiries and test drives captured on the site flow directly into this CRM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CRM PIPELINE (KANBAN) ================= */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            {/* CRM Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>Customer Relationship Management (CRM)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    {leads.length} Active Leads
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Track inquiries from first touch to delivery</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search name, phone, car..."
                    className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-white border-gray-200'
                    }`}
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsAddLeadOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
              {STAGES.map((stage) => {
                const stageLeads = leads
                  .filter((l) => l.stage === stage.key)
                  .filter((l) => {
                    if (!leadSearch) return true;
                    const q = leadSearch.toLowerCase();
                    return (
                      l.customer_name.toLowerCase().includes(q) ||
                      l.customer_phone.includes(q) ||
                      (l.car_interested && l.car_interested.toLowerCase().includes(q))
                    );
                  });

                return (
                  <div
                    key={stage.key}
                    className={`rounded-2xl border p-3 flex flex-col min-h-[480px] ${
                      isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full border-2 ${stage.color} bg-current`} />
                        <span className="font-bold text-xs">{stage.label}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/10">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className={`p-3 rounded-xl border text-xs transition-all relative group ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-white/8'
                              : 'bg-gray-50 border-gray-200 hover:border-orange-500/50'
                          }`}
                        >
                          {/* Priority & Source */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                                lead.priority === 'hot'
                                  ? 'bg-red-500/20 text-red-400'
                                  : lead.priority === 'warm'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {lead.priority}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">{lead.lead_source}</span>
                          </div>

                          {/* Customer Name & Car */}
                          <div className="font-bold text-sm mb-0.5">{lead.customer_name}</div>
                          <div className="text-[11px] text-orange-400 font-semibold truncate mb-1">
                            {lead.car_interested || 'General Inquiry'}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center justify-between mb-2">
                            <span>Budget: {formatPriceINR(lead.budget)}</span>
                            <span>{lead.city}</span>
                          </div>

                          {lead.notes && (
                            <p className="text-[10px] text-gray-400 italic bg-black/20 p-1.5 rounded-lg mb-2 line-clamp-2">
                              "{lead.notes}"
                            </p>
                          )}

                          {/* Action Buttons: WhatsApp, Call, Stage Move */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                            <a
                              href={`https://wa.me/${lead.customer_phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.customer_name)},%20I%20am%20calling%20from%20BetterCars%20regarding%20${encodeURIComponent(lead.car_interested || 'your enquiry')}.`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${lead.customer_phone}`}
                              title="Call Lead"
                              className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>

                            {/* Move Stage Selector */}
                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as any)}
                              className={`flex-1 text-[10px] px-1.5 py-1 rounded-lg border font-semibold outline-none ${
                                isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-white border-gray-200 text-gray-900'
                              }`}
                            >
                              {STAGES.map((s) => (
                                <option key={s.key} value={s.key} className={isDark ? 'bg-[#181920]' : ''}>
                                  ➔ {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Delete Lead"
                              className="p-1 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {stageLeads.length === 0 && (
                        <div className="h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-[11px] text-gray-400">
                          No leads in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CAR INVENTORY ================= */}
        {activeTab === 'cars' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>Showroom Inventory Management</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    {cars.length} Cars Online
                  </span>
                </h2>
                <p className="text-xs text-gray-400">Add, edit, upload photos and control live car listings</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={carSearch}
                    onChange={(e) => setCarSearch(e.target.value)}
                    placeholder="Search brand, model..."
                    className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-white border-gray-200'
                    }`}
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsAddCarOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Car</span>
                </button>
              </div>
            </div>

            {/* Cars Table */}
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Car Image & Model</th>
                      <th className="py-3 px-3">Year</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">EMI</th>
                      <th className="py-3 px-3">Fuel / Transmission</th>
                      <th className="py-3 px-3">KM</th>
                      <th className="py-3 px-3">Badge</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cars
                      .filter((c) => {
                        if (!carSearch) return true;
                        const q = carSearch.toLowerCase();
                        return c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q);
                      })
                      .map((car) => (
                        <tr key={car.id} className={`hover:bg-white/5 transition-colors ${isDark ? '' : 'hover:bg-gray-50'}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={car.image}
                                alt={car.model}
                                className="w-12 h-9 object-cover rounded-lg border border-white/10 flex-shrink-0"
                              />
                              <div>
                                <span className="font-bold block text-sm">{car.brand} {car.model}</span>
                                <span className="text-[10px] text-gray-400">{car.bodyType || 'SUV'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold">{car.year}</td>
                          <td className="py-3 px-3 font-bold text-orange-500">{formatPriceINR(car.price)}</td>
                          <td className="py-3 px-3 text-gray-400">₹{car.emi.toLocaleString('en-IN')}/mo</td>
                          <td className="py-3 px-3">
                            <span className="font-medium block">{car.fuel}</span>
                            <span className="text-[10px] text-gray-400">{car.transmission}</span>
                          </td>
                          <td className="py-3 px-3 font-medium">{car.km.toLocaleString('en-IN')} km</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                              {car.badge || 'Verified'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Live
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TEST DRIVE BOOKINGS ================= */}
        {activeTab === 'testdrives' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Customer Test Drive Bookings</h2>
                <p className="text-xs text-gray-400">Direct bookings submitted from the website</p>
              </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-3">Car Requested</th>
                      <th className="py-3 px-3">Date & Slot</th>
                      <th className="py-3 px-3">Mode</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {testDrives.map((td) => (
                      <tr key={td.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold block">{td.customer_name}</span>
                          <a href={`tel:${td.customer_phone}`} className="text-[11px] text-blue-400 hover:underline">
                            {td.customer_phone}
                          </a>
                        </td>
                        <td className="py-3 px-3 font-semibold text-orange-400">{td.car_name}</td>
                        <td className="py-3 px-3">
                          <span className="font-medium block">{td.drive_date}</span>
                          <span className="text-[10px] text-gray-400">{td.drive_time_slot}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                            td.drive_mode === 'doorstep' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {td.drive_mode}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {td.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleConvertTDToLead(td)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
                          >
                            Add to CRM
                          </button>
                        </td>
                      </tr>
                    ))}
                    {testDrives.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No test drives recorded yet in Supabase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SELL INQUIRIES ================= */}
        {activeTab === 'sellinquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Sell Car Inquiries (RTO Backed)</h2>
                <p className="text-xs text-gray-400">Cars submitted by owners for direct sale or valuation</p>
              </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Reg Number</th>
                      <th className="py-3 px-3">Vehicle Details</th>
                      <th className="py-3 px-3">Km & Fuel</th>
                      <th className="py-3 px-3">Offered Valuation Range</th>
                      <th className="py-3 px-3">Seller Contact</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sellInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded border border-white/15">
                            {inq.registration_number}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold block">{inq.year} {inq.brand} {inq.model}</span>
                          <span className="text-[10px] text-gray-400">{inq.transmission}</span>
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {inq.km_driven.toLocaleString('en-IN')} km • {inq.fuel_type}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-400">
                          {formatPriceINR(inq.estimated_min_price)} – {formatPriceINR(inq.estimated_max_price)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium block">{inq.seller_name || 'Owner'}</span>
                          <span className="text-[10px] text-gray-400">{inq.seller_phone}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleConvertSellToLead(inq)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
                          >
                            Add to CRM
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sellInquiries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No sell inquiries recorded yet in Supabase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Customer Signups & Client Directory</h2>
                <p className="text-xs text-gray-400">Registered users and interest profiles</p>
              </div>

              <button
                onClick={() => setNewCustModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Customer</span>
              </button>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#111218] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-bold uppercase tracking-wider text-[10px] ${
                    isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">City</th>
                      <th className="py-3 px-3">Interested In</th>
                      <th className="py-3 px-4 text-right">Quick Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold">{c.name}</td>
                        <td className="py-3 px-3 font-semibold text-blue-400">{c.phone}</td>
                        <td className="py-3 px-3 text-gray-400">{c.email || '--'}</td>
                        <td className="py-3 px-3 text-gray-300">{c.city || 'Delhi NCR'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            {c.interested_in}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <a href={`tel:${c.phone}`} className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Car Modal */}
      <AddCarModal
        isOpen={isAddCarOpen}
        onClose={() => setIsAddCarOpen(false)}
        onCarAdded={(newCar) => {
          setCars((prev) => [newCar, ...prev]);
        }}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        onLeadAdded={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
        }}
      />

      {/* Quick Add Customer Modal */}
      {newCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setNewCustModal(false)} />
          <div className={`relative w-full max-w-sm rounded-2xl p-6 border shadow-2xl ${isDark ? 'bg-[#101117] border-white/10 text-white' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-base mb-3">Add Customer Signup</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={custForm.name}
                onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-white/5 border-white/15"
              />
              <input
                type="text"
                placeholder="Phone (+91...)"
                required
                value={custForm.phone}
                onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-white/5 border-white/15"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={custForm.email}
                onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-white/5 border-white/15"
              />
              <select
                value={custForm.interested_in}
                onChange={(e) => setCustForm({ ...custForm, interested_in: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-[#181920] border-white/15"
              >
                <option value="buy">Interested in Buying</option>
                <option value="sell">Interested in Selling</option>
                <option value="finance">Interested in Car Loan / Finance</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCustModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-orange-500 text-white"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
