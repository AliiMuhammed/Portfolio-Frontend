import React from "react";
import { motion } from "framer-motion";

const StairsAnimation = {
  initial: { top: "100%" },
  animate: { top: 0 },
  exit: { top: "100%" }, // Animates out of view
};

const reverseIndex = (index) => {
  const totalSteps = 6;
  return totalSteps - index - 1;
};

const Stairs = () => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={StairsAnimation}
          transition={{
            duration: 0.6,
            delay: reverseIndex(index) * 0.1,
            ease: "easeInOut",
          }}
          className="absolute left-0 w-full h-[16.66%] bg-white"
          style={{ top: `${index * 16.66}%` }}
        />
      ))}
    </div>
  );
};

export default Stairs;
