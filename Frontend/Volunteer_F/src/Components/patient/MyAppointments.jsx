import { useEffect, useState } from 'react';
import api from '../../services/api';


const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState(null);

    const fetchAppointments = () => {
        const token = localStorage.getItem("access_token");
        console.log("Token before request:", token);
        api.get('appointments/patient/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            console.log("Appointments response:", res.data);
            setAppointments(res.data);
            if (res.data.length === 0) {
                setError("No appointments found. Are you registered as a patient?");
            } else {
                setError(null);
            }
        })
        .catch(err => {
            console.error("Error fetching appointments:", err.response?.data || err.message);
            setError("Failed to load appointments: " + (err.response?.data?.detail || err.message));
        });
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return (
        <div>
            <h3>My Appointments</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {appointments.map(app => {
                    const doctorName = app.slot?.doctor?.name || 'Unknown Doctor';
                    const startTime = app.slot?.start_time
                        ? new Date(app.slot.start_time).toLocaleString()
                        : 'N/A';

                    return (
                        <li key={app.id}>
                            Doctor: {doctorName}, 
                            Time: {startTime}, 
                            Reason: {app.reason || 'N/A'}, 
                            Status: {app.status}

                            {app.status === "approved" && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => window.open(`/video-call/${app.id}`, "_blank")}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Join Call
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

export default MyAppointments;
