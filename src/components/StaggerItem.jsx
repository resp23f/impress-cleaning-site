'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StaggerItem({ 
  children, 
  className = "",
  delay = 0,
  once = true,
  direction = "up",
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
        duration: 0.5,
        delay: delay / 1000,
        ease: [0.33, 1, 0.68, 1] // Smooth easing
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
      style={{ willChange: isInView ? 'auto' : 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}