import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Video, 
  MessageSquareText, 
  BrainCircuit, 
  Users, 
  Pill, 
  Bot, 
  Activity 
} from "lucide-react";

// Feature Data with specific colors for variety
const features = [
  {
    title: "Volunteer Doctors",
    description: "Connect with certified doctors volunteering their time to help those in need.",
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Video Consultation",
    description: "Talk to doctors in real-time with high-quality encrypted video calls.",
    icon: Video,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Smart Messaging",
    description: "Send reports, receive prescriptions, and stay in touch securely.",
    icon: MessageSquareText,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Decision Support",
    description: "Empowering doctors with AI-based clinical decision support tools.",
    icon: BrainCircuit,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    title: "Patient Management",
    description: "Easily manage patient records, appointments, and histories.",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Drug Search",
    description: "Search and verify drug information, interactions, and alternatives.",
    icon: Pill,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    title: "AI Health Bot",
    description: "24/7 smart assistant for answering immediate medical queries.",
    icon: Bot,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Visual Vitals",
    description: "Track health trends with beautiful, auto-generated data charts.",
    icon: Activity,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function FeatureSection() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-600 font-semibold text-sm uppercase tracking-wider bg-blue-100 px-3 py-1 rounded-full"
          >
            Why Choose Us
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Comprehensive Digital Health Tools
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-slate-600"
          >
            Everything you need to provide and receive excellent healthcare, all in one modern platform.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="flex flex-col items-start h-full">
                {/* Icon Box */}
                <div className={`p-3 rounded-xl mb-5 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export default FeatureSection;