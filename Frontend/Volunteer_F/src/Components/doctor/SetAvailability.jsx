import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const SetAvailability = () => {
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    slot_duration: 15,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const formatToISO = (date, time) => {
    if (!date || !time) return "";
    const [hours, minutes] = time.split(":");
    const isoDate = new Date(date);
    isoDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return isoDate.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    const doctorId = localStorage.getItem("user_id");

    if (!doctorId || !token) {
      setError("Please log in as a doctor to set availability.");
      navigate("/login/doctor");
      return;
    }

    const startDateTime = formatToISO(formData.date, formData.start_time);
    const endDateTime = formatToISO(formData.date, formData.end_time);

    if (!startDateTime || !endDateTime) {
      setError("Please provide valid date and time.");
      return;
    }

    const availabilityData = {
      doctor: doctorId,
      start_time: startDateTime,
      end_time: endDateTime,
      slot_duration: parseInt(formData.slot_duration),
    };

    try {
      const response = await api.post("/availability/create/", availabilityData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Availability successfully added.");
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        slot_duration: 15,
      });
    } catch (error) {
      const errorMessage =
        error.response?.status === 401 || error.response?.status === 403
          ? "Authentication failed. Please log in again."
          : error.response?.data?.start_time?.[0] ||
            error.response?.data?.end_time?.[0] ||
            error.response?.data?.detail ||
            "Failed to set availability. Please check your input.";
      setError(errorMessage);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("doctorId");
        navigate("/login/doctor");
      }
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="flex flex-col">
          <label htmlFor="date" className="mb-2 font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="start_time" className="mb-2 font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            name="start_time"
            id="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="end_time" className="mb-2 font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            name="end_time"
            id="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="slot_duration"
            className="mb-2 font-medium text-gray-700"
          >
            Slot Duration (minutes)
          </label>
          <input
            type="number"
            name="slot_duration"
            id="slot_duration"
            value={formData.slot_duration}
            onChange={handleChange}
            min="5"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Set Availability
        </button>
      </form>
    </div>
  );
};

export default SetAvailability;
