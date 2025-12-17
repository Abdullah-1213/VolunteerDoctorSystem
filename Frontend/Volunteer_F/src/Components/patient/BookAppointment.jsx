// File: src/components/patient/BookAppointment.jsx

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  Stethoscope,
  CalendarCheck
} from "lucide-react";

// --- Helpers ---
const formatDate = (dateString) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const BookAppointment = ({ doctorId }) => {
  const [slots, setSlots] = useState([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false); // UI state for button
  const [selectedSlotId, setSelectedSlotId] = useState(null); // UI state for selection
  
  const navigate = useNavigate();

  useEffect(() => {
    if (doctorId) {
      setLoading(true);
      api
        .get(`availability/?doctor_id=${doctorId}`)
        .then((res) => {
          setSlots(res.data);
          setError(
            res.data.length === 0
              ? "No available slots found for this doctor."
              : null
          );
        })
        .catch((err) => {
          setError(
            "Failed to load slots: " +
              (err.response?.data?.detail || err.message)
          );
        })
        .finally(() => setLoading(false));
    }
  }, [doctorId]);

  // --- Logic: Group Slots by Date ---
  const groupedSlots = useMemo(() => {
    const groups = {};
    slots
      .filter((s) => !s.is_booked)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .forEach((slot) => {
        const dateKey = formatDate(slot.start_time);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(slot);
      });
    return groups;
  }, [slots]);

  const handleBook = async () => {
    if (!selectedSlotId) return;
    
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload = { slot_id: selectedSlotId, reason };

      await api.post("appointments/create/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Show success briefly or use a toast library if available
      alert("✅ Appointment booked successfully");
      navigate("/dashboard-pt/appointments");

    } catch (err) {
      setError(
        "Failed to book appointment: " +
          (err.response?.data?.detail || JSON.stringify(err.response?.data))
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedSlotObj = slots.find(s => s.id === selectedSlotId);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="text-emerald-600" /> 
            Book Appointment
          </h1>
          <p className="text-slate-500 text-sm">Select a time slot that works for you</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Slots Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-32" />
                ))}
             </div>
          ) : Object.keys(groupedSlots).length > 0 ? (
            Object.entries(groupedSlots).map(([date, daySlots], index) => (
              <motion.div 
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Date Header */}
                <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex items-center gap-2 font-semibold text-slate-700">
                  <Calendar size={18} className="text-emerald-500" />
                  {date}
                </div>

                {/* Slots Grid */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`
                        relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                        ${selectedSlotId === slot.id 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 scale-105" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:shadow-sm hover:bg-emerald-50"
                        }
                      `}
                    >
                      <span className="text-sm font-bold flex items-center gap-1.5">
                        {formatTime(slot.start_time)}
                      </span>
                      {selectedSlotId === slot.id && (
                        <motion.div 
                          layoutId="check"
                          className="absolute -top-2 -right-2 bg-white text-emerald-600 rounded-full p-0.5 shadow-sm"
                        >
                          <CheckCircle2 size={16} fill="white" className="text-emerald-600" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
             !loading && !error && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-400">No open slots available right now.</p>
              </div>
             )
          )}
        </div>

        {/* RIGHT COLUMN: Booking Summary (Sticky) */}
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 flex flex-col gap-6">
            
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Appointment Details</h3>
              <div className="w-12 h-1 bg-emerald-500 rounded-full" />
            </div>

            {/* Selected Slot Info */}
            <div className={`
              p-4 rounded-xl border transition-colors duration-300
              ${selectedSlotId ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}
            `}>
              {!selectedSlotId ? (
                <div className="flex flex-col items-center text-center text-slate-400 py-2">
                  <Clock size={24} className="mb-2 opacity-50" />
                  <span className="text-sm">Select a time slot from the left to proceed</span>
                </div>
              ) : (
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-slate-700">
                      <Calendar size={16} className="text-emerald-600" />
                      <span className="font-medium">{formatDate(selectedSlotObj.start_time)}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-700">
                      <Clock size={16} className="text-emerald-600" />
                      <span className="font-medium">
                        {formatTime(selectedSlotObj.start_time)} - {formatTime(selectedSlotObj.end_time)}
                      </span>
                   </div>
                </div>
              )}
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Reason for Visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none h-24"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleBook}
              disabled={!selectedSlotId || bookingLoading}
              className={`
                w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${!selectedSlotId 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98]"
                }
              `}
            >
              {bookingLoading ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Confirming...
                 </>
              ) : (
                <>Confirm Booking <CheckCircle2 size={18} /></>
              )}
            </button>
            
            <p className="text-xs text-center text-slate-400">
              By booking, you agree to our cancellation policy.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BookAppointment;