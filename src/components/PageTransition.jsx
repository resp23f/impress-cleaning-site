'use client';

import { motion } from 'framer-motion';

export default function StaggerItem({ children, className = "" }) {
  const itemVariants = {
    initial: { 
      opacity: 0, 
      y: 6 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,  // ← Slower (was 0.28)
        ease: [0.4, 0, 0.6, 1],
        when: "beforeChildren",
        staggerChildren: 0.03  // ← Also slow down stagger (was 0.02)
      }
    },
    exit: { 
      opacity: 0, 
      y: -4,
      transition: {
        duration: 0.35,  // ← Slower (was 0.25)
        ease: [0.4, 0, 0.6, 1]
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}