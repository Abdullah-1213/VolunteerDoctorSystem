import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  Calendar, 
  Clock, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ArrowRight,
  LayoutGrid
} from "lucide-react";

const SetAvailability = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // State
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    slot_duration: 15,
  });
  
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" }); // Global status (success/error)

  // --- 1. Real-time Slot Calculation (The UX Booster) ---
  useEffect(() => {
    if (formData.start_time && formData.end_time && formData.slot_duration) {
      calculatePreviewSlots();
    } else {
      setGeneratedSlots([]);
    }
    // Clear errors when user types to reduce frustration
    if (Object.keys(errors).length > 0) setErrors({});
  }, [formData]);

  const calculatePreviewSlots = () => {
    try {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const durationMs = parseInt(formData.slot_duration) * 60000;
      
      if (start >= end) {
        setGeneratedSlots([]);
        return;
      }

      const slots = [];
      let current = start.getTime();
      const endTime = end.getTime();

      while (current + durationMs <= endTime) {
        slots.push(new Date(current).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
        current += durationMs;
      }
      setGeneratedSlots(slots);
    } catch (e) {
      setGeneratedSlots([]);
    }
  };

  // --- 2. Validation Logic ---
  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (!formData.date) newErrors.date = "Required";
    else if (formData.date < today) newErrors.date = "Date cannot be in the past";

    if (!formData.start_time) newErrors.start_time = "Required";
    else if (formData.date === today && formData.start_time < currentTime) {
      newErrors.start_time = "Cannot start in the past";
    }

    if (!formData.end_time) newErrors.end_time = "Required";
    else if (formData.start_time && formData.end_time <= formData.start_time) {
      newErrors.end_time = "Must be after start time";
    }

    if (!formData.slot_duration || formData.slot_duration < 5) {
      newErrors.slot_duration = "Min 5 mins";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus({ type: null, message: "" });
  };

  // --- 3. Advanced Error Parsing (The "Best Handling" part) ---
  const handleServerError = (error) => {
    console.error("Server Error:", error);
    
    // 1. Auth Errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      setStatus({ type: "error", message: "Session expired. Redirecting..." });
      setTimeout(() => navigate("/login/doctor"), 2000);
      return;
    }

    const data = error.response?.data;
    const newErrors = {};

    // 2. Django Field Errors (e.g., {"start_time": ["Invalid format"]})
    if (typeof data === "object" && !Array.isArray(data)) {
      Object.keys(data).forEach((key) => {
        if (key === "detail") {
           // Generic DRF error
           setStatus({ type: "error", message: data[key] });
        } else if (Array.isArray(data[key])) {
           // Field specific error map to input
           newErrors[key] = data[key][0]; 
        } else {
           // Fallback for string errors
           setStatus({ type: "error", message: String(data[key]) });
        }
      });
    } 
    // 3. Django Array Errors (e.g., ["Overlapping slots found"])
    else if (Array.isArray(data)) {
      setStatus({ type: "error", message: data[0] });
    } 
    // 4. Fallback
    else {
      setStatus({ type: "error", message: "Something went wrong. Please try again." });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // If we have specific field errors, don't show a global error banner unless necessary
      if (!status.message) {
         setStatus({ type: "error", message: "Please correct the highlighted fields." });
      }
    }
  };

  // --- 4. Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    // Format ISO Dates
    const startDateTime = new Date(`${formData.date}T${formData.start_time}`).toISOString();
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`).toISOString();

    const payload = {
      start_time: startDateTime,
      end_time: endDateTime,
      duration: formData.slot_duration, // Matches your Python "duration" field
    };

    try {
      // Assuming the endpoint maps to DoctorAvailabilitySplitView
      // Note: Adjust URL based on your urls.py (e.g., 'availability/split/' or 'availability/create/')
      await api.post("/availability/create/", payload);

      setStatus({ type: "success", message: "Availability set successfully!" });
      setFormData({ ...formData, start_time: "", end_time: "" }); // Keep date/duration, reset times
      setGeneratedSlots([]);
      
      // Optional: Redirect or clear message after delay
      setTimeout(() => setStatus({ type: null, message: "" }), 5000);

    } catch (error) {
      handleServerError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const InputWrapper = ({ label, icon: Icon, name, error, children }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Icon size={16} className={error ? "text-red-500" : "text-blue-600"} />
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium animate-pulse">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Set Availability</h2>

          {/* Global Status Alert */}
          {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${
              status.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {status.type === "error" ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputWrapper label="Select Date" icon={Calendar} name="date" error={errors.date}>
              <input
                type="date"
                name="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'} outline-none transition-all`}
              />
            </InputWrapper>

            <div className="grid grid-cols-2 gap-4">
              <InputWrapper label="Start Time" icon={Clock} name="start_time" error={errors.start_time}>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${errors.start_time ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'} outline-none transition-all`}
                />
              </InputWrapper>

              <InputWrapper label="End Time" icon={ArrowRight} name="end_time" error={errors.end_time}>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${errors.end_time ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'} outline-none transition-all`}
                />
              </InputWrapper>
            </div>

            <InputWrapper label="Slot Duration (Minutes)" icon={Timer} name="slot_duration" error={errors.slot_duration}>
              <div className="relative">
                <input
                  type="number"
                  name="slot_duration"
                  min="5"
                  max="240"
                  value={formData.slot_duration}
                  onChange={handleChange}
                  className={`w-full p-3 pl-3 pr-12 rounded-lg border ${errors.slot_duration ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'} outline-none transition-all`}
                />
                <span className="absolute right-4 top-3.5 text-gray-400 text-sm">min</span>
              </div>
            </InputWrapper>

            <button
              type="submit"
              disabled={isSubmitting || generatedSlots.length === 0}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Slots...
                </>
              ) : (
                <>
                  Save Availability
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Preview & Stats */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-6 sm:p-8 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <LayoutGrid size={20} className="text-gray-400" />
            Preview Summary
          </h3>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Slots</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {generatedSlots.length > 0 ? generatedSlots.length : "-"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Time</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {generatedSlots.length > 0 ? `${(generatedSlots.length * formData.slot_duration) / 60} hrs` : "-"}
              </p>
            </div>
          </div>

          {/* Slots Visualizer */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-inner overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Generated Slots</span>
              {generatedSlots.length > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Valid</span>}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {generatedSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {generatedSlots.map((slot, idx) => (
                    <div key={idx} className="bg-blue-50 text-blue-700 text-xs font-semibold py-2 px-1 text-center rounded border border-blue-100">
                      {slot}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
                  <Clock size={40} />
                  <p className="text-sm text-center px-4">Enter time range to preview generated appointment slots</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 text-xs text-gray-400 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <Info size={16} className="text-blue-400 shrink-0" />
            <p>
              Slots that overlap with existing bookings or breaks will be automatically rejected by the system.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetAvailability;