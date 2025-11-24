import { useForm } from "react-hook-form";
import PropTypes from "prop-types";

export default function CnicForm({ cnic, setCnic, handleSearch, error, patientData }) {
  const {
    register,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  // Masking logic: user types digits only → formatted automatically
  const formatCNIC = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const handleChange = (e) => {
    setCnic(formatCNIC(e.target.value));
  };

  const isValidCNIC = /^\d{5}-\d{7}-\d{1}$/.test(cnic);

  return (
    <div className="p-4 bg-white rounded shadow space-y-2">
      <label className="text-gray-700 font-medium">Enter CNIC</label>

      <input
        type="text"
        value={cnic}
        onChange={handleChange}
        className={`border p-2 rounded w-full ${
          !isValidCNIC && cnic.length > 0 ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="12345-1234567-1"
      />

      {/* ❌ Error under input */}
      {!isValidCNIC && cnic.length > 0 && (
        <p className="text-red-500 text-sm">Invalid CNIC format (required: 12345-1234567-1)</p>
      )}

      {/* Backend errors (only show when format is valid) */}
      {error && isValidCNIC && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={isValidCNIC ? handleSearch : undefined}
        disabled={!isValidCNIC}
        className={`px-4 py-2 rounded text-white w-full ${
          isValidCNIC ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Search
      </button>
    </div>
  );
}

CnicForm.propTypes = {
  cnic: PropTypes.string.isRequired,
  setCnic: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  error: PropTypes.string,
  patientData: PropTypes.object,
};
