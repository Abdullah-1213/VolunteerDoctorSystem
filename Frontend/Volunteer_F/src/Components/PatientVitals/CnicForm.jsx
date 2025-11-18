import PropTypes from "prop-types";

const CnicForm = ({ cnic, setCnic, handleSearch, patientData, error }) => {
  const handleChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters

    // Auto-insert dashes
    if (value.length > 5 && value.length <= 12) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    } else if (value.length > 12) {
      value = value.slice(0, 5) + "-" + value.slice(5, 12) + "-" + value.slice(12, 13);
    }

    setCnic(value);
  };

  const handleBlur = () => {
    // Validate final format on blur
    if (cnic && !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
      alert("Invalid CNIC format! Use 12345-1234567-1");
      setCnic("");
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          placeholder="Enter CNIC (e.g. 12345-1234567-1)"
          value={cnic}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={15}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="CNIC Input"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          aria-label="Search Patient"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {patientData && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">{patientData.name}</h2>
          <p className="text-gray-500">Age: {patientData.age}</p>
          <p className="text-gray-500">Gender: {patientData.gender}</p>
        </div>
      )}
    </div>
  );
};

CnicForm.propTypes = {
  cnic: PropTypes.string.isRequired,
  setCnic: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  patientData: PropTypes.object,
  error: PropTypes.string,
};

export default CnicForm;
