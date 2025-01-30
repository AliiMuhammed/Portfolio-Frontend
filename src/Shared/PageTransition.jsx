"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [showPageContent, setShowPageContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPageContent(true), 800); // Wait for stairs to finish
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
     
      {showPageContent && (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 1, ease: "easeInOut" },
            }}
            exit={{ opacity: 0 }}
            className="fixed h-screen w-screen bg-[#1c1c22] z-[99999]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default PageTransition;
