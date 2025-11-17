'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, Mail, HelpCircle, Send, ChevronDown } from 'lucide-react';

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after 3 seconds, only once per session
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem('hasSeenContactTooltip');
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        sessionStorage.setItem('hasSeenContactTooltip', 'true');
      }, 3000);

      // Hide tooltip after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  // Add this to your ContactButton.jsx file

  const contactOptions = [
    {
        name: 'Chat with us',
        description: 'Start a live conversation',
        icon: MessageCircle,
        color: 'bg-green-500',
        action: () => {
          // Open Tawk.to chat widget maximized (full screen)
          if (window.Tawk_API && window.Tawk_API.maximize) {
            window.Tawk_API.maximize();
          }
          setIsOpen(false);
        }
      },
        {
      name: 'Call us',
      description: '(512) 277-5364',
      icon: Phone,
      color: 'bg-blue-500',
      action: () => {
        window.location.href = 'tel:+15122775364';
      }
    },
    {
      name: 'Email us',
      description: 'Get a response within 24h',
      icon: Mail,
      color: 'bg-purple-500',
      action: () => {
        window.location.href = 'mailto:info@impresscleaning.com';
      }
    },
    {
      name: 'Help center',
      description: 'Browse FAQs',
      icon: HelpCircle,
      color: 'bg-orange-500',
      action: () => {
        window.location.href = '/faq';
      }
    }
  ];

  return (
    <>
      {/* Backdrop - subtle blur effect */}
      {isOpen && (
        <div
        data-contact-backdrop  
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 animate-slideIn">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg relative">
            <p className="text-sm font-medium">Need help? Click here!</p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Contact Options Menu - Improved responsive design */}
      <div
        data-contact-menu
      className={`fixed z-50 transition-all duration-300 ease-out transform ${
        isOpen 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }
        bottom-20 right-4 
        md:bottom-24 md:right-6 
        w-[calc(100%-2rem)] 
        sm:w-[360px] 
        md:w-[380px]
        max-w-[380px]`}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header - Smaller on mobile */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">Need Help?</h3>
                  <p className="text-green-100 text-xs sm:text-sm">We're here for you</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Contact Options - Responsive sizing */}
          <div className="p-3 sm:p-4 space-y-2">
            {contactOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${option.color} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <option.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-gray-900 font-semibold text-sm sm:text-base">{option.name}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{option.description}</p>
                </div>
                <Send className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          {/* Footer - Optional business hours */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Available Mon-Fri 8am-6pm CST
            </p>
          </div>
        </div>
      </div>

      {/* Floating Button - Responsive sizing with pulse animation */}
<button
data-chat-button  // ← ADD THIS LINE
onClick={() => setIsOpen(!isOpen)}
className={`fixed z-50 transition-all duration-300
  bottom-4 right-4 
  md:bottom-6 md:right-6 
  ${isOpen 
    ? 'bg-gray-800 scale-90 rotate-180' 
    : 'bg-gradient-to-r from-green-600 to-green-700 hover:scale-110 animate-pulse-subtle'
  }
  text-white shadow-lg hover:shadow-xl
  w-14 h-14 sm:w-16 sm:h-16 
  rounded-full 
  flex items-center justify-center`}
aria-label="Contact us"
>
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
        ) : (
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
        )}
      </button>

      {/* Add these styles to your global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
      `}</style>
    </>
  );
}