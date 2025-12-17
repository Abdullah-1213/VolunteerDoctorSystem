import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

function WebBanner() {
  // Animation variants for staggered text entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="relative bg-slate-50 overflow-hidden">
      {/* 🎨 Background Decorative Shapes (Blobs) */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-teal-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24 lg:py-32 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* --- Left Side: Content --- */}
        <motion.div
          className="flex-1 text-center lg:text-left space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow Tag */}
          <motion.span
            variants={itemVariants}
            className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wider uppercase mb-2"
          >
            Healthcare Reimagined
          </motion.span>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15]"
          >
            Your Bridge to Better <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Digital Health Connect
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            A smarter way to connect, consult, and care. We bring doctors and
            patients together on one secure, modern platform.
          </motion.p>

          {/* Action Buttons (Universal for Mobile & Desktop) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
          >
            <Link
              to="/choice/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200/50 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/choice/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 active:scale-95"
            >
              Existing Member Login
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center lg:justify-start gap-6 pt-6 text-sm font-medium text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" /> Verified Specialists
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Secure Platform
            </div>
          </motion.div>
        </motion.div>

        {/* --- Right Side: Image --- */}
        <motion.div
          className="flex-1 w-full max-w-lg lg:max-w-none relative"
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        >
          {/* Image decorative backdrop */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
          
          <img
            src="/ban.jpg"
            alt="Doctors and patients connecting digitally"
            className="w-full h-auto object-cover rounded-[2rem] shadow-2xl shadow-blue-900/20 border-4 border-white relative z-10"
          />
           {/* Optional Floating Badge over image */}
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 1, duration: 0.8, type: "spring" }}
             className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 z-20"
           >
              <div className="bg-green-100 p-2 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Doctors Available</p>
                <p className="text-sm font-bold text-gray-900">Connect Instantly</p>
              </div>
           </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default WebBanner;