import { useEffect, useState } from 'react';
import api from '../../services/api';

const BookAppointment = ({ doctorId }) => {
  const [slots, setSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (doctorId) {
      console.log("Fetching slots for doctor_id:", doctorId);
      api.get(`availability/?doctor_id=${doctorId}`)
        .then(res => {
          console.log("Slots response:", res.data);
          setSlots(res.data);
          if (res.data.length === 0) {
            setError("No available slots for this doctor.");
          } else {
            setError(null);
          }
        })
        .catch(err => {
          console.error("Error fetching slots:", err.response?.data || err.message);
          setError("Failed to load slots: " + (err.response?.data?.detail || err.message));
        });
    }
  }, [doctorId]);

const handleBook = async (slotId) => {
    try {
        const token = localStorage.getItem("access_token")
        console.log("Authenticated user token:", token);
        const payload = { slot_id: slotId, reason: reason };

        console.log("Sending booking payload:", payload);
        await api.post('appointments/create/', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Appointment booked successfully');
        api.get(`availability/?doctor_id=${doctorId}`)
            .then(res => {
                console.log("Refreshed slots:", res.data);
                setSlots(res.data);
                if (res.data.length === 0) {
                    setError("No available slots for this doctor.");
                } else {
                    setError(null);
                }
            })
            .catch(err => console.error("Error refreshing slots:", err.response?.data || err.message));
    } catch (err) {
        console.error("Error booking appointment:", err.response?.data || err.message);
        setError("Failed to book appointment: " + (err.response?.data?.detail || JSON.stringify(err.response?.data)));
    }
};

  return (
    <div>
      <h3>Available Slots</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        placeholder="Reason for visit"
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
      <ul>
        {slots.filter(s => !s.is_booked).map(slot => (
          <li key={slot.id}>
            {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
            <button onClick={() => handleBook(slot.id)}>Book</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookAppointment;