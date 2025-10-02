import React, { useEffect, useState } from "react";

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "https://2efd97cb6034.ngrok-free.app/api/prescriptions/",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch prescriptions");

        const data = await response.json();
        setPrescriptions(data);
      } catch (err) {
        console.error("❌ Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) return <p>Loading prescriptions...</p>;

  if (prescriptions.length === 0) {
    return <p>No prescriptions found.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Prescriptions</h2>
      <ul className="space-y-4">
        {prescriptions.map((p) => (
          <li
            key={p.id}
            className="p-4 rounded-lg shadow bg-green-50 border border-green-200"
          >
            <p><strong>ID:</strong> {p.id}</p>
            <p><strong>Date:</strong> {new Date(p.created_at).toLocaleString()}</p>
            <p><strong>Doctor:</strong> {p.doctor_name || p.doctor}</p>
            <p><strong>Room:</strong> {p.room_id}</p>
            <p className="mt-2"><strong>Prescription:</strong> {p.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyPrescriptions;
