import { useEffect, useState } from "react";
import api from "../../services/api";
import { CalendarClock, User, AlertCircle, Video, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DoctorAppointments = ({app}) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

      const sorted = [...res.data].sort((a, b) => {
        return new Date(b?.slot?.start_time) - new Date(a?.slot?.start_time);
      });

      setAppointments(sorted);
      setFiltered(sorted);
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

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    const now = new Date();
    let data = [...appointments];

    if (filter === "today") {
      data = data.filter(
        (app) =>
          new Date(app.slot.start_time).toDateString() === now.toDateString()
      );
    }
    if (filter === "upcoming") {
      data = data.filter((app) => new Date(app.slot.start_time) > now);
    }
    if (filter === "completed") {
      data = data.filter((app) => app.status === "completed");
    }
    if (filter === "cancelled") {
      data = data.filter((app) =>
        ["cancelled", "rejected"].includes(app.status)
      );
    }

    setFiltered(data);
  };

  const updateStatus = async (appointmentId, newStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      await api.patch(
        `appointments/${appointmentId}/update-status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-gray-300 text-gray-700",
    };
    return `px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.completed}`;
  };

  const filters = [
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Your Appointments
          </h2>
          <p className="text-md text-gray-600">Manage your patient appointments</p>
        </div>

        {/* FILTER DROPDOWN */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => applyFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-md font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {filters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-md">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 ml-3 font-medium">Loading...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-3">
              <CalendarClock size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 font-medium">No matching appointments</p>
            <p className="text-md text-gray-400 mt-1">Try changing the filter</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((app) => {
            const patientName = app.patient?.full_name || "Unknown Patient";
            const startTime = app.slot?.start_time
              ? new Date(app.slot.start_time).toLocaleString()
              : "N/A";
            const endTime = app.slot?.end_time ? new Date(app.slot.end_time) : null;
            const now = new Date();

            const isLive =
              endTime &&
              app.status === "confirmed" &&
              now >= new Date(app.slot.start_time) &&
              now <= endTime;

            return (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
              >
                {/* Patient Name & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User className="text-blue-600 shrink-0" size={18} />
                    <span className="font-semibold text-gray-900 text-sm truncate">
                      {patientName}
                    </span>
                  </div>
                  <span className={statusBadge(app.status)}>
                    {app.status.toUpperCase()}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-start gap-2 mb-1 text-md text-gray-600">
                  <CalendarClock size={14} className="text-purple-600 shrink-0 mt-0.5" />
                  <span className="break-words">{startTime}</span>
                </div>

                {/* Reason */}
                <div className="text-md text-gray-600 mb-3 pl-5">
                  <span className="font-medium">Reason:</span> {app.reason || "N/A"}
                </div>

                {/* Action Buttons */}
                {(isLive || app.status === "pending") && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {isLive && (
                  <button
                    onClick={() => navigate(`/video-call/${app.id}`)}
                    className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-md font-medium hover:bg-blue-700 transition"
                  >
                    <Video size={14} />
                    Join Call
                  </button>
                    )}

                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "confirmed")}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-md font-medium hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "cancelled")}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-md font-medium hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;