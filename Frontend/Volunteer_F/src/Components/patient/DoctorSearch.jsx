// src/components/DoctorSearch.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';

const DoctorSearch = ({ onSelect }) => {
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        console.log("Token before request:", token);
        api.get('doctors/')
            .then(res => setDoctors(res.data))
            .catch(err => {
                console.error("Error fetching doctors:", err.response?.data || err.message);
                setError("Failed to load doctors. Please try again.");
            });
    }, []);

    return (
        <div>
            <h3>Select Doctor</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <select onChange={(e) => onSelect(e.target.value)}>
                <option value="">-- Select --</option>
                {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                        {doc.full_name || doc.email} {/* Use full_name */}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default DoctorSearch;