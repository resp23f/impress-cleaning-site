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
  rootMargin = "-100px"
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
      y: 50,  // Increased from 20-30 to 50 for more dramatic movement
      scale: 0.9,  // More noticeable scale change
      filter: "blur(10px)"  // Add blur for extra effect
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,  // Slightly longer duration
        delay: delay / 1000,
        ease: [0.25, 0.1, 0.25, 1],  // Different easing for more "pop"
        // Stagger the properties for a more dynamic effect
        opacity: { duration: 0.6 },
        y: { duration: 0.8 },
        scale: { duration: 0.6, delay: (delay / 1000) + 0.1 },
        filter: { duration: 0.4 }
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
      viewport={{ once: once, margin: rootMargin }}  // Add viewport prop
    >
      {children}
    </motion.div>
  );
}