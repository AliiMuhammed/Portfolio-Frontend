"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import React from "react";
import Stairs from "./Stairs";

const StairTransition = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[10000000] pointer-events-none"
      >
        <Stairs />
      </motion.div>
    </AnimatePresence>
  );
};

export default StairTransition;
