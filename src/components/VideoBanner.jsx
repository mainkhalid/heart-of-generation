import React, { useState } from 'react';
import { motion } from 'framer-motion';

const VideoBanner = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.7,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-red-600 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      
      <motion.div 
        className="container mx-auto px-4 py-12 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Video section with enhanced styling */}
          <motion.div 
            className="relative rounded-xl overflow-hidden shadow-2xl"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-black/20 rounded-xl z-10 pointer-events-none"></div>
            
            {/* Loading indicator that fades out when video loads */}
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            <iframe
              src="https://www.youtube.com/embed/swvwNgfKw2M?si=nowtDdT1HarIC9Op"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="aspect-video w-full"
              onLoad={() => setIsVideoLoaded(true)}
            ></iframe>
            
            {/* Play button overlay for design enhancement */}
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full z-20 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs font-medium">LIVE</span>
            </div>
          </motion.div>
          
          {/* Text section with enhanced styling and animations */}
          <motion.div 
            className="space-y-6 text-center md:text-left text-white"
            variants={itemVariants}
          >
            <div className="inline-flex items-center space-x-2 mb-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span className="text-xs uppercase tracking-wider font-semibold">Featured Content</span>
            </div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
              variants={itemVariants}
            >
              Watch Our Video
            </motion.h1>
            
            <motion.div 
              className="h-1 w-16 bg-white/40 md:mx-0 mx-auto"
              variants={itemVariants}
            ></motion.div>
            
            <motion.p 
              className="text-white/80 text-lg leading-relaxed max-w-md mx-auto md:mx-0"
              variants={itemVariants}
            >
              Experience our groundbreaking approach to empowering children through education, creativity, and compassion. Our innovative programs have transformed thousands of lives across communities.
            </motion.p>
            
            <motion.div 
              className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              variants={itemVariants}
            >
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                Get Started
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
              
              <button className="px-8 py-3 bg-transparent border-2 border-white/30 hover:border-white/80 text-white font-semibold rounded-full transition-all duration-300 flex items-center justify-center">
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoBanner;