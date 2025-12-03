'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Breadcrumbs({ items }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-4 px-4 md:px-6"
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home Icon */}
          <li>
            <Link 
              href="/" 
              className="flex items-center text-gray-500 hover:text-[#079447] transition-colors duration-200 group"
            >
              <svg 
                className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              <span className="ml-1.5 font-medium">Home</span>
            </Link>
          </li>

          {/* Breadcrumb Items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={index} className="flex items-center">
                {/* Separator */}
                <svg 
                  className="w-4 h-4 text-gray-400 mx-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>

                {/* Breadcrumb Link or Text */}
                {isLast ? (
                  <span className="text-gray-700 font-semibold">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href} 
                    className="text-gray-500 hover:text-[#079447] transition-colors duration-200 font-medium"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
}