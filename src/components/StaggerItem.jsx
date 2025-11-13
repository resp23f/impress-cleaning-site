'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StaggerItem({ children, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true,  // Animation happens only once
    margin: "-100px"  // Trigger 100px before element enters viewport
  });

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.6, 1]
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}