import { useEffect, useState } from 'react';
import api from '../../services/api';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState(null);

    const fetchAppointments = () => {
        const token = localStorage.getItem("access_token");
        console.log("Token before request:", token);
        api.get('appointments/patient/')
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
            <h3 className="text-2xl font-bold text-green-700 mb-6">My Appointments</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map(app => {
                    const doctorName = app.slot?.doctor?.name || 'Unknown Doctor';
                    const startTime = app.slot?.start_time
                        ? new Date(app.slot.start_time).toLocaleString()
                        : 'N/A';
                    const statusColor = app.status === "approved" ? "green" : app.status === "pending" ? "yellow" : "red";

                    return (
                        <div
                            key={app.id}
                            className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl"
                        >
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-800">Doctor: {doctorName}</h4>
                                <p className="text-gray-500">Time: {startTime}</p>
                                <p className="text-gray-500">Reason: {app.reason || 'N/A'}</p>
                                <p className={`font-semibold mt-2 text-${statusColor}-600`}>
                                    Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </p>
                            </div>

                            {app.status === "approved" && (
                                <button
                                    onClick={() => window.open(`/video-call/${app.id}`, "_blank")}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Join Call
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyAppointments;
