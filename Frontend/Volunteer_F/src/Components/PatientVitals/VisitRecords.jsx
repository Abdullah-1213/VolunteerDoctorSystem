import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useState } from "react";

const VisitRecords = ({ visits, currentPatient, refreshVisits, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const handleEdit = (visit) => {
    setEditingId(visit.id);
    Object.keys(visit).forEach((key) => setValue(key, visit[key]));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await onDelete(id); // ✅ Call backend delete function from parent
      refreshVisits();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await onUpdate(editingId, data); // ✅ call parent function for update
      setEditingId(null);
      reset();
      refreshVisits();
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update record.");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Visit Records</h2>
      {visits.length === 0 ? (
        <p className="text-gray-500">No records found.</p>
      ) : (
        visits.map((visit) =>
          editingId === visit.id ? (
            <form key={visit.id} onSubmit={handleSubmit(handleUpdate)} className="p-4 bg-yellow-50 shadow rounded-lg space-y-3">
              <input {...register("bp")} className="border p-2 rounded w-full" placeholder="BP" />
              <input {...register("hr")} className="border p-2 rounded w-full" placeholder="HR" />
              <input {...register("temp")} className="border p-2 rounded w-full" placeholder="Temperature" />
              <input {...register("spo2")} className="border p-2 rounded w-full" placeholder="SpO₂" />
              <input {...register("diagnosis")} className="border p-2 rounded w-full" placeholder="Diagnosis" />
              <div className="flex gap-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded" type="submit">Update</button>
                <button
                  type="button"
                  onClick={() => { setEditingId(null); reset(); }}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div key={visit.id} className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-700">{visit.name}</h3>
                <p className="text-sm text-gray-500">
                  BP: {visit.bp} | HR: {visit.hr} | Temp: {visit.temp}°C | SpO₂: {visit.spo2}%
                </p>
                <p className="text-sm text-gray-500">Diagnosis: {visit.diagnosis}</p>
                <p className="text-sm text-gray-400">{visit.date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(visit)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
                <button onClick={() => handleDelete(visit.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};

VisitRecords.propTypes = {
  visits: PropTypes.array.isRequired,
  currentPatient: PropTypes.object,
  refreshVisits: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default VisitRecords;
