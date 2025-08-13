import { motion } from "framer-motion";

function WebBanner() {
  return (
    <div className="bg-blue-100 py-16 px-6 custom:px-20 flex flex-col custom:flex-row items-center justify-between gap-10">
      
      {/* Left Side - Image with Animation */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src="/ban.jpg" // Make sure this path is correct (place bannar.jpg in /public)
          alt="Web Banner"
          className="w-full rounded-xl shadow-xl"
        />
      </motion.div>

      {/* Right Side - Text with Animation */}
      <motion.div
        className="text-center custom:text-left max-w-xl"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
          Welcome Doctors & Patients
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          A smarter way to connect, consult, and care.
        </p>
        <button className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-800 transition">
          Get Started
        </button>
      </motion.div>
    </div>
  );
}

export default WebBanner;
