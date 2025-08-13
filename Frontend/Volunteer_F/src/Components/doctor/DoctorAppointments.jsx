import { useEffect, useState } from "react";
import api from "../../services/api";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
        setAppointments(res.data);
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

  const updateStatus = async (appointmentId, newStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      await api.patch(
        `appointments/${appointmentId}/update-status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Status updated successfully");
      fetchAppointments(); // Refresh after update
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  return (
    <div>
      {error && (
        <p className="text-red-600 font-semibold mb-4">{error}</p>
      )}
      {loading && (
        <p className="text-gray-500 mb-4 italic">Loading appointments...</p>
      )}
      {!loading && appointments.length === 0 && (
        <p className="text-gray-600 italic">No appointments found.</p>
      )}

      <ul className="space-y-6">
        {appointments.map((app) => {
          const patientName = app.patient?.full_name || "Unknown Patient";
          const startTime = app.slot?.start_time
            ? new Date(app.slot.start_time).toLocaleString()
            : "N/A";
          return (
            <li
              key={app.id}
              className="p-5 border border-blue-200 rounded-xl shadow-sm bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
            >
              <p>
                <span className="font-semibold">Patient:</span> {patientName}
              </p>
              <p>
                <span className="font-semibold">Time:</span> {startTime}
              </p>
              <p>
                <span className="font-semibold">Reason:</span> {app.reason || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`font-semibold ${
                    app.status === "approved"
                      ? "text-green-600"
                      : app.status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {app.status}
                </span>
              </p>
              {app.status === "approved" && (
                  <div className="mt-4">
                      <button
                          onClick={() => window.open(`/video-call/${app.id}`, "_blank")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                          Join Call
                      </button>
                  </div>
              )}

              {app.status === "pending" && (
                <div className="mt-4 space-x-4">
                  <button
                    onClick={() => updateStatus(app.id, "approved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(app.id, "rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DoctorAppointments;
