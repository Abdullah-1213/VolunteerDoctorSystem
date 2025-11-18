import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Calendar, Clock, Timer } from "lucide-react";

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
      await api.post("/availability/create/", availabilityData, {
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
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Set Your Availability
      </h2>

      {error && (
        <p className="text-red-600 font-semibold mb-4 text-center bg-red-100 p-2 rounded-lg">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 font-medium text-gray-700 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Select Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Start Time */}
        <div className="flex flex-col">
          <label htmlFor="start_time" className="mb-1 font-medium text-gray-700 flex items-center gap-2">
            <Clock size={18} className="text-green-600" />
            Start Time
          </label>
          <input
            type="time"
            name="start_time"
            id="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label htmlFor="end_time" className="mb-1 font-medium text-gray-700 flex items-center gap-2">
            <Clock size={18} className="text-red-600" />
            End Time
          </label>
          <input
            type="time"
            name="end_time"
            id="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          />
        </div>

        {/* Slot Duration */}
        <div className="flex flex-col">
          <label htmlFor="slot_duration" className="mb-1 font-medium text-gray-700 flex items-center gap-2">
            <Timer size={18} className="text-purple-600" />
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
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg 
          hover:bg-blue-700 shadow-md hover:shadow-lg transition-all text-lg"
        >
          Save Availability
        </button>
      </form>
    </div>
  );
};

export default SetAvailability;
