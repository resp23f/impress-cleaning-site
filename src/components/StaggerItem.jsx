'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StaggerItem({ 
  children, 
  className = "",
  delay = 0,
  once = true,
  threshold = 0.1,
  rootMargin = "-50px"
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: once,
    amount: threshold,
    margin: rootMargin
  });

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: delay / 1000, // Convert ms to seconds for Framer Motion
        ease: [0.16, 1, 0.3, 1], // More natural easing curve
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