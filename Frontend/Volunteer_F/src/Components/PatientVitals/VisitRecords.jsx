import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import React from "react";

const VisitRecords = ({
  visits,
  currentPatient,
  refreshVisits,
  onDelete,
  onUpdate
}) => {
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  // Load selected visit into form inputs
  const handleEdit = useCallback((visit) => {
    setEditingId(visit.id);

    // Only set fields that exist in your API
    const fields = ["bp", "hr", "temp", "spo2", "diagnosis"];

    fields.forEach((f) => {
      if (visit[f] !== undefined) {
        setValue(f, visit[f]);
      }
    });
  }, [setValue]);

  const handleDeleteClick = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this record?")) return;

      try {
        await onDelete(id);
        refreshVisits();
      } catch (err) {
        console.error("❌ Delete failed:", err);
        alert("Failed to delete record.");
      }
    },
    [onDelete, refreshVisits]
  );

  const handleUpdateSubmit = useCallback(
    async (data) => {
      try {
        await onUpdate(editingId, data);
        setEditingId(null);
        reset();
        refreshVisits();
      } catch (err) {
        console.error("❌ Update failed:", err);
        alert("Failed to update record.");
      }
    },
    [editingId, onUpdate, refreshVisits, reset]
  );

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Visit Records</h2>

      {visits.length === 0 ? (
        <p className="text-gray-500">No records found.</p>
      ) : (
        visits.map((visit) =>
          editingId === visit.id ? (
            // ======================
            //        EDIT FORM
            // ======================
            <form
              key={visit.id}
              onSubmit={handleSubmit(handleUpdateSubmit)}
              className="p-4 bg-yellow-50 shadow rounded-xl space-y-3 border border-yellow-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input {...register("bp")} className="border p-2 rounded w-full" placeholder="BP" />
                <input {...register("hr")} className="border p-2 rounded w-full" placeholder="HR" />
                <input {...register("temp")} className="border p-2 rounded w-full" placeholder="Temperature" />
                <input {...register("spo2")} className="border p-2 rounded w-full" placeholder="SpO₂" />
              </div>

              <input
                {...register("diagnosis")}
                className="border p-2 rounded w-full"
                placeholder="Diagnosis"
              />

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">
                  Update
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    reset();
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // ======================
            //       DISPLAY CARD
            // ======================
            <div
              key={visit.id}
              className="p-4 bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-700">{visit.name}</h3>
                
                <p className="text-sm text-gray-600">
                  <span className="font-medium">BP:</span> {visit.bp} |
                  <span className="font-medium ml-1">HR:</span> {visit.hr} |
                  <span className="font-medium ml-1">Temp:</span> {visit.temp}°C |
                  <span className="font-medium ml-1">SpO₂:</span> {visit.spo2}%
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                </p>

                <p className="text-xs text-gray-400">{visit.date}</p>
              </div>

              <div className="flex flex-row sm:flex-col gap-2">
                <button
                  onClick={() => handleEdit(visit)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded w-full sm:w-24"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteClick(visit.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-24"
                >
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
  onUpdate: PropTypes.func.isRequired
};

export default React.memo(VisitRecords);
