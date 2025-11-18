import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ add this
import api from "../../services/api";

const BookAppointment = ({ doctorId }) => {
  const [slots, setSlots] = useState([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ initialize router navigation

  useEffect(() => {
    if (doctorId) {
      setLoading(true);
      api
        .get(`availability/?doctor_id=${doctorId}`)
        .then((res) => {
          setSlots(res.data);
          setError(
            res.data.length === 0
              ? "No available slots for this doctor."
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

  const handleBook = async (slotId) => {
    try {
      const token = localStorage.getItem("access_token");
      const payload = { slot_id: slotId, reason };

      await api.post("appointments/create/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Appointment booked successfully");

      // ✅ redirect after success
      navigate("/dashboard-pt/appointments");

    } catch (err) {
      setError(
        "Failed to book appointment: " +
          (err.response?.data?.detail ||
            JSON.stringify(err.response?.data))
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl border border-green-200">
      <h2 className="text-2xl font-bold text-center mb-4 text-green-600">
        Book Appointment
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Reason for visit"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading slots...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots
            .filter((s) => !s.is_booked)
            .map((slot) => (
              <div
                key={slot.id}
                className="p-4 border rounded-lg shadow hover:shadow-md transition bg-green-50 flex flex-col justify-between"
              >
                <div>
                  <p className="text-gray-700 font-medium">
                    {new Date(slot.start_time).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    to {new Date(slot.end_time).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleBook(slot.id)}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Book
                </button>
              </div>
            ))}
        </div>
      )}

      {!loading &&
        slots.filter((s) => !s.is_booked).length === 0 &&
        !error && (
          <p className="text-center text-gray-500 mt-4">
            All slots are booked.
          </p>
        )}
    </div>
  );
};

export default BookAppointment;
