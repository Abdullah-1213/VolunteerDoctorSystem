import { FaUserMd, FaVideo, FaComments, FaBrain, FaNotesMedical, FaCapsules, FaRobot, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
  {
    title: "Volunteer Doctors",
    description: "Connect with certified doctors volunteering their time to help those in need.",
    icon: <FaUserMd className="text-4xl text-blue-600 mb-4" />,
  },
  {
    title: "Audio & Video Consultation",
    description: "Talk to doctors in real-time with free audio and video consultations.",
    icon: <FaVideo className="text-4xl text-green-600 mb-4" />,
  },
  {
    title: "Messaging & Prescriptions",
    description: "Send reports, receive prescriptions, and stay in touch with your doctor.",
    icon: <FaComments className="text-4xl text-purple-600 mb-4" />,
  },
  {
    title: "Decision Support System",
    description: "Empowering doctors with AI-based clinical decision support tools.",
    icon: <FaBrain className="text-4xl text-red-600 mb-4" />,
  },
  {
    title: "Patient Management",
    description: "Easily manage patient records, appointments, and histories in one place.",
    icon: <FaNotesMedical className="text-4xl text-yellow-600 mb-4" />,
  },
  {
    title: "Drug Search",
    description: "Search and verify drug information and alternatives instantly.",
    icon: <FaCapsules className="text-4xl text-pink-600 mb-4" />,
  },
  {
    title: "AI Chatbot",
    description: "24/7 smart assistant for both doctors and patients to ask questions.",
    icon: <FaRobot className="text-4xl text-indigo-600 mb-4" />,
  },
  {
    title: "Visual Vitals",
    description: "Digitally visualize vitals — no need for handwritten prescriptions.",
    icon: <FaChartLine className="text-4xl text-cyan-600 mb-4" />,
  },
];

function FeatureSection() {
  return (
    <div className="py-20 px-6 sm:px-12 lg:px-24 bg-white text-center">
      <h2 className="text-3xl font-bold text-blue-700 mb-12">
        Key Features
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-xl transition"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="flex flex-col items-center">
              {feature.icon}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default FeatureSection;
