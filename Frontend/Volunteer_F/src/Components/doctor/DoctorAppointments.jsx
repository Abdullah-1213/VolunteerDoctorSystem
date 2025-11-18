import { useEffect, useState } from "react";
import api from "../../services/api";
import { CalendarClock, User, AlertCircle, Video } from "lucide-react";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch appointments from API
  const fetchAppointments = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    setLoading(true);

    api
      .get("appointments/doctor/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Sort newest first
        const sorted = [...res.data].sort((a, b) => {
          const timeA = new Date(a?.slot?.start_time || 0).getTime();
          const timeB = new Date(b?.slot?.start_time || 0).getTime();
          return timeB - timeA;
        });

        setAppointments(sorted);
        setError(null);
      })
      .catch((err) => {
        setError(
          "Failed to fetch appointments: " +
            (err.response?.data?.detail || err.message)
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Automatically mark completed if appointment ended
  useEffect(() => {
    const interval = setInterval(() => {
      appointments.forEach((app) => {
        const endTime = app.slot?.end_time ? new Date(app.slot.end_time) : null;
        const now = new Date();
        if (endTime && now > endTime && app.status === "approved") {
          updateStatus(app.id, "completed");
        }
      });
    }, 60000); // check every 1 minute

    return () => clearInterval(interval);
  }, [appointments]);

  // Update appointment status API
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
      alert(
        "Failed to update status: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  // STATUS BADGE STYLE
  const statusBadge = (status) => {
    const colors = {
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-gray-100 text-gray-700",
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.completed}`;
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Your Appointments
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading && (
        <p className="text-gray-600 italic mb-4">Loading appointments...</p>
      )}

      {!loading && appointments.length === 0 && (
        <p className="text-gray-500 italic">No appointments found.</p>
      )}

      <ul className="space-y-4">
        {appointments.map((app) => {
          const patientName = app.patient?.full_name || "Unknown Patient";
          const startTime = app.slot?.start_time
            ? new Date(app.slot.start_time).toLocaleString()
            : "N/A";
          const endTime = app.slot?.end_time ? new Date(app.slot.end_time) : null;
          const now = new Date();

          // Check if appointment is currently live
          const isLive =
            endTime &&
            app.status === "approved" &&
            now >= new Date(app.slot.start_time) &&
            now <= endTime;

          return (
            <li
              key={app.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-5 hover:shadow-lg transition-all"
            >
              {/* Top Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  <span className="font-semibold text-gray-800">{patientName}</span>
                </div>
                <span className={statusBadge(app.status)}>
                  {app.status.toUpperCase()}
                </span>
              </div>

              {/* Appointment Details */}
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <CalendarClock size={18} className="text-purple-600" />
                  <span className="font-medium">Time:</span> {startTime}
                </p>
                <p>
                  <span className="font-medium">Reason:</span> {app.reason || "N/A"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                {/* Join Call - only if approved AND currently live */}
                {isLive && (
                  <button
                    onClick={() =>
                      window.open(`/video-call/${app.id}`, "_blank")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    <Video size={18} />
                    Join Call
                  </button>
                )}

                {/* Pending Approve/Reject */}
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(app.id, "approved")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DoctorAppointments;
