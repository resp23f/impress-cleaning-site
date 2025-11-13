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
        duration: 0.4,
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