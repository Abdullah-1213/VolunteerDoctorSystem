import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function WebBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10">

      {/* Left Side Image */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9 }}
      >
        <img
          src="/ban.jpg"
          alt="Web Banner"
          className="w-full rounded-2xl shadow-xl border border-blue-200"
        />
      </motion.div>

      {/* Right Side */}
      <motion.div
        className="text-center md:text-left max-w-xl space-y-5"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 leading-tight">
          Welcome Doctors & Patients
        </h1>

        <p className="text-lg text-gray-700 max-w-md mx-auto md:mx-0">
          A smarter way to connect, consult, and care — powered by modern digital health.
        </p>

        {/* ⭐ Mobile Buttons only */}
        <div className="flex gap-4 justify-center md:hidden mt-6">
          <Link
            to="/choice/signup"
            className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 active:scale-95 transition duration-300"
          >
            Sign Up
          </Link>

          <Link
            to="/choice/login"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md border border-blue-600 hover:bg-white hover:text-blue-600 active:scale-95 transition duration-300"
          >
            Login
          </Link>
        </div>

        {/* ⭐ Desktop Only Box */}
        <div className="hidden md:flex flex-col p-6 bg-white shadow-xl rounded-2xl border border-blue-100 mt-4">
          <p className="text-xl font-semibold text-blue-700">
            Your Digital Health Partner
          </p>
          <p className="text-gray-600 mt-1">
            Access login & sign-up from the top navigation bar.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default WebBanner;
