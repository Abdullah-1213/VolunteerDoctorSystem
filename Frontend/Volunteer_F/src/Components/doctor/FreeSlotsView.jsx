import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const FreeSlotsView = () => {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const doctorId = localStorage.getItem("user_id");

    if (!token || !doctorId) {
      setError("Please log in as a doctor to view availability.");
      navigate("/login/doctor");
      return;
    }

    const fetchSlots = async () => {
      try {
        const response = await api.get(`/availability/?doctor_id=${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allSlots = response.data;

        const filteredSlots = allSlots.filter((slot) => {
          const slotDoctorId =
            typeof slot.doctor === "object" ? slot.doctor.id : slot.doctor;
          return slotDoctorId === parseInt(doctorId);
        });

        setSlots(filteredSlots);
      } catch (err) {
        const errorMessage =
          err.response?.status === 401 || err.response?.status === 403
            ? "Session expired. Please log in again."
            : err.response?.data?.detail || "Failed to fetch availability.";

        setError(errorMessage);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("doctorId");
          navigate("/login/doctor");
        }
      }
    };

    fetchSlots();
  }, [navigate]);

  return (
    <div>
      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {slots.length === 0 && !error && (
        <p className="italic text-gray-600">No available slots found for this doctor.</p>
      )}

      <ul className="space-y-3">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className={`p-3 rounded-lg border border-blue-300 ${
              slot.is_booked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            } shadow-sm font-semibold`}
          >
            {new Date(slot.start_time).toLocaleString("en-PK", {
              timeZone: "Asia/Karachi",
              dateStyle: "full",
              timeStyle: "short",
            })}{" "}
            - {slot.is_booked ? "Booked" : "Free"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FreeSlotsView;
