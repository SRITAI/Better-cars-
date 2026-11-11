import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { createCRMLead, type CRMLead } from '../../services/adminService';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: (lead: CRMLead) => void;
}

export default function AddLeadModal({ isOpen, onClose, onLeadAdded }: AddLeadModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [carInterested, setCarInterested] = useState('');
  const [budget, setBudget] = useState('1500000');
  const [leadSource, setLeadSource] = useState<CRMLead['lead_source']>('Walk-in');
  const [priority, setPriority] = useState<CRMLead['priority']>('hot');
  const [stage, setStage] = useState<CRMLead['stage']>('new');
  const [assignedTo, setAssignedTo] = useState('Aman Verma');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter customer full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newLead = await createCRMLead({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        city,
        car_interested: carInterested.trim() || 'Any Verified SUV / Sedan',
        budget: Number(budget) || undefined,
        lead_source: leadSource,
        stage,
        priority,
        assigned_to: assignedTo,
        notes: notes.trim() || undefined,
      });

      onLeadAdded(newLead);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#101117] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Add CRM Lead</h3>
                <p className="text-xs text-gray-400">Capture lead from phone enquiry or showroom walk-in</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                  isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Vehicle of Interest</label>
                <input
                  type="text"
                  value={carInterested}
                  onChange={(e) => setCarInterested(e.target.value)}
                  placeholder="e.g. Creta or Fortuner"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Budget (₹ INR)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 1500000"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Lead Source</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="Walk-in">Showroom Walk-in</option>
                  <option value="Phone">Phone Call</option>
                  <option value="Website">Website Form</option>
                  <option value="Test Drive">Test Drive Booking</option>
                  <option value="Sell Car">Sell Car Inquirer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="hot">🔥 Hot (Immediate Buy)</option>
                  <option value="warm">⚡ Warm (This Month)</option>
                  <option value="cold">❄️ Cold (Exploring)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Pipeline Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="new">New Inquiries</option>
                  <option value="contacted">Contacted</option>
                  <option value="test_drive_scheduled">Test Drive Scheduled</option>
                  <option value="negotiation">Negotiation / Loan</option>
                  <option value="won">Deal Won (Sold)</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Delhi"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Assigned Sales Agent</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Aman Verma"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                    isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Notes & Follow-up Remarks</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Customer preferences, specific variant request, downpayment discussion..."
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none resize-none ${
                  isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating...' : 'Create CRM Lead'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
