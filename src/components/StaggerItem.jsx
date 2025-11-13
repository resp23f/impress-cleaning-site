// components/StaggerItem.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function StaggerItem({ 
  children, 
  delay = 0, 
  threshold = 0.1,
  rootMargin = '-50px 0px',
  duration = 700,
  once = true  // Add this prop to control re-animation
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element is entering the viewport
          if (!isVisible) {
            setTimeout(() => setIsVisible(true), delay);
          }
        } else if (!once && isVisible) {
          // Element is leaving viewport - only reset if once=false
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, isVisible, threshold, rootMargin, once]);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}