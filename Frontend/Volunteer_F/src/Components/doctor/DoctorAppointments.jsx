import { useEffect, useState } from "react";
import api from "../../services/api";
import { CalendarClock, User, AlertCircle, Video, Clock, ShieldCheck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper function to format date/time
const formatTime = (isoString) => {
  if (!isoString) return { date: "N/A", time: "N/A" };
  const dateObj = new Date(isoString);
  return {
    date: dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
    time: dateObj.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
};

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("upcoming"); // Default to upcoming
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Status and Color Mapping ---
  const statusConfig = {
    confirmed: { label: "Confirmed", color: "green", icon: ShieldCheck, stripe: "border-green-500" },
    rejected: { label: "Rejected", color: "red", icon: XCircle, stripe: "border-red-500" },
    pending: { label: "Pending Review", color: "yellow", icon: Clock, stripe: "border-yellow-500" },
    completed: { label: "Completed", color: "gray", icon: ShieldCheck, stripe: "border-gray-500" },
    cancelled: { label: "Cancelled", color: "slate", icon: XCircle, stripe: "border-slate-500" },
  };

  const statusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.completed;
    return `px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`;
  };

  // --- Data Fetching ---
  const fetchAppointments = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get("appointments/doctor/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sort by date/time ascending (upcoming first)
      const sorted = [...res.data].sort((a, b) => {
        return new Date(a?.slot?.start_time) - new Date(b?.slot?.start_time);
      });

      setAppointments(sorted);
      // Automatically apply filter after fetch
      applyFilter(activeFilter, sorted); 
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch appointments: " +
        (err.response?.data?.detail || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --- Filtering Logic ---
  const applyFilter = (filter, data = appointments) => {
    setActiveFilter(filter);
    const now = new Date();
    let result = [...data];

    if (filter === "today") {
      result = result.filter(
        (app) => new Date(app.slot.start_time).toDateString() === now.toDateString() && app.status !== "completed"
      );
    } else if (filter === "upcoming") {
      result = result.filter(
        (app) => new Date(app.slot.start_time) > now && app.status === "confirmed"
      );
    } else if (filter === "pending") {
      result = result.filter((app) => app.status === "pending");
    } else if (filter === "completed") {
      result = result.filter((app) => app.status === "completed");
    } else if (filter === "cancelled") {
      result = result.filter((app) => ["cancelled", "rejected"].includes(app.status));
    }

    setFiltered(result);
  };

  // --- Status Update Logic ---
  const updateStatus = async (appointmentId, newStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      setLoading(true);
      await api.patch(
        `appointments/${appointmentId}/update-status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Re-fetch data to update the list
      await fetchAppointments(); 
    } catch (err) {
      setError("Failed to update status.");
      console.error("Failed to update status:", err);
    } finally {
        setLoading(false);
    }
  };

  // --- Filter Tabs Configuration ---
  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "upcoming", label: "Upcoming" },
    { value: "today", label: "Today" },
    { value: "completed", label: "History" },
  ];

  // --- Component Render ---
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appointment Manager</h2>
        <p className="text-gray-500 text-sm">Review, confirm, or start patient sessions.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => applyFilter(f.value)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200
              ${activeFilter === f.value
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }
            `}
            disabled={loading}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error & Loading Status */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 shadow-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 ml-3 font-medium">Loading appointments...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center my-8">
          <CalendarClock size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No appointments found.</p>
          <p className="text-sm text-gray-400 mt-1">
            There are no appointments matching the "{filters.find(f => f.value === activeFilter)?.label}" filter.
          </p>
        </div>
      )}

      {/* Appointment List (Cards) */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((app) => {
            const patientName = app.patient?.full_name || "Unknown Patient";
            const timeData = formatTime(app.slot?.start_time);
            const statusDetail = statusConfig[app.status] || statusConfig.completed;
            const now = new Date();
            const slotStart = app.slot?.start_time ? new Date(app.slot.start_time) : null;
            const slotEnd = app.slot?.end_time ? new Date(app.slot.end_time) : null;
            
            // Define Join Call eligibility (e.g., within 5 minutes before start to end time)
            const isJoinable = 
                app.status === "confirmed";
                // slotStart && 
                // slotEnd && 
                // now >= new Date(slotStart.getTime() - 5 * 60000) && 
                // now <= slotEnd;

            const isPending = app.status === "pending";

            return (
              <div
                key={app.id}
                className={`bg-white rounded-xl shadow-md border-l-4 ${statusDetail.stripe} overflow-hidden transition-shadow duration-300 hover:shadow-lg`}
              >
                <div className="p-4 sm:p-5">
                  {/* Row 1: Patient Name & Status */}
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <User className="text-blue-600 shrink-0" size={20} />
                      <span className="font-bold text-lg text-gray-900 truncate">
                        {patientName}
                      </span>
                    </div>
                    <span className={statusBadge(app.status)}>
                      {statusDetail.label}
                    </span>
                  </div>

                  {/* Row 2: Date & Time */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarClock size={16} className="text-purple-500 shrink-0" />
                      <span className="font-medium text-gray-700">{timeData.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-500 shrink-0" />
                      <span className="font-medium text-gray-700">{timeData.time}</span>
                    </div>
                  </div>
                  
                  {/* Row 3: Reason */}
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-semibold text-gray-700">Reason:</span> {app.reason || "Consultation"}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    {isJoinable && (
                      <button
                        onClick={() => navigate(`/video-call/${app.id}`)}
                        className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md"
                      >
                        <Video size={16} />
                        Join Call
                      </button>
                    )}

                    {isPending && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "confirmed")}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "rejected")}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {/* Fallback Action for Confirmed/Upcoming that aren't joinable yet */}
                    {!isJoinable && app.status === "confirmed" && slotStart > now && (
                        <p className="flex-1 text-center text-sm text-blue-500 font-medium py-2 border border-blue-100 rounded-lg">
                            Starts in {slotStart.toLocaleString("en-US", {hour: 'numeric', minute:'2-digit'})}
                        </p>
                    )}
                    
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;