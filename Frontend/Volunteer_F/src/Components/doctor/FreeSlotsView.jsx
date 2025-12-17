import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  CalendarDays, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  CalendarX
} from "lucide-react";

const FreeSlotsView = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- Fetch Logic ---
  const fetchSlots = async () => {
    const token = localStorage.getItem("access_token");
    const doctorId = localStorage.getItem("user_id");

    if (!token || !doctorId) {
      navigate("/login/doctor");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Assuming API filters by doctor_id correctly
      const response = await api.get(`/availability/?doctor_id=${doctorId}`);
      
      // Client-side safety filter (optional depending on API)
      const validSlots = response.data.filter(slot => {
         const slotDocId = typeof slot.doctor === "object" ? slot.doctor.id : slot.doctor;
         return String(slotDocId) === String(doctorId);
      });

      setSlots(validSlots);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
         localStorage.clear();
         navigate("/login/doctor");
      } else {
         setError("Could not load your schedule. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // --- Grouping Logic (The UX Magic) ---
  const groupedSlots = useMemo(() => {
    const groups = {};
    
    // Sort slots by time first
    const sorted = [...slots].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    sorted.forEach((slot) => {
      const dateObj = new Date(slot.start_time);
      // Format: "Friday, Oct 27"
      const dateKey = dateObj.toLocaleDateString("en-US", { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    });

    return groups;
  }, [slots]);

  // --- Sub-components ---

  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-20 bg-gray-100 rounded-xl border border-gray-200"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="text-blue-600" />
            My Slots
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of your available and booked time slots.
          </p>
        </div>
        <button 
          onClick={fetchSlots} 
          disabled={loading}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          title="Refresh Slots"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <SkeletonLoader />}

      {/* Empty State */}
      {!loading && slots.length === 0 && !error && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <CalendarX size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No Availability Found</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">
            You haven't set any slots yet. Go to "Set Availability" to get started.
          </p>
        </div>
      )}

      {/* Content Grid */}
      {!loading && Object.entries(groupedSlots).map(([date, daySlots]) => (
        <div key={date} className="mb-8 last:mb-0">
          
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-bold text-gray-700 bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-sm sticky top-0 z-10">
              {date}
            </h3>
            <span className="text-xs font-medium text-gray-400">
              {daySlots.length} slots
            </span>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {daySlots.map((slot) => {
              const startTime = new Date(slot.start_time).toLocaleTimeString("en-US", {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              
              // Calculate end time just for display
              const endTime = new Date(slot.end_time).toLocaleTimeString("en-US", {
                 hour: 'numeric',
                 minute: '2-digit',
                 hour12: true
              });

              return (
                <div 
                  key={slot.id}
                  className={`
                    relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                    ${slot.is_booked 
                      ? "bg-gray-50 border-gray-200 opacity-75 cursor-not-allowed" 
                      : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md cursor-default"
                    }
                  `}
                >
                  {/* Status Icon */}
                  <div className="absolute top-2 right-2">
                    {slot.is_booked ? (
                      <Lock size={14} className="text-gray-400" />
                    ) : (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Time */}
                  <div className={`font-bold text-lg mb-1 ${slot.is_booked ? "text-gray-500" : "text-gray-800"}`}>
                    {startTime}
                  </div>
                  
                  {/* Sub-text */}
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {slot.is_booked ? "Booked" : "Available"}
                  </div>

                  {/* Hover Info (For available slots) */}
                  {!slot.is_booked && (
                     <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform rounded-b-xl" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FreeSlotsView;