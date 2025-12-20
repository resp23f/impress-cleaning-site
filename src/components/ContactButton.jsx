'use client';
import { useState } from 'react';
import { X, MessageCircle, Phone, Mail, HelpCircle, Send } from 'lucide-react';

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      name: 'Chat with us',
      description: 'Start a live conversation',
      icon: MessageCircle,
      color: 'bg-[#079447]',
      action: () => {
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
      color: 'bg-[#1C294E]',
      action: () => {
        window.location.href = 'tel:+15122775364';
      }
    },
    {
      name: 'Email us',
      description: 'Get a response within 24h',
      icon: Mail,
      color: 'bg-[#079447]/80',
      action: () => {
        window.location.href = 'mailto:info@impresscleaning.com';
      }
    },
    {
      name: 'Help center',
      description: 'Browse FAQs',
      icon: HelpCircle,
      color: 'bg-[#1C294E]/80',
      action: () => {
        window.location.href = '/faq';
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          data-contact-backdrop
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contact Options Menu */}
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
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#079447] to-[#06803d] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg">Need Help?</h3>
                  <p className="text-white/80 text-xs sm:text-sm">We're here for you</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Contact Options */}
          <div className="p-3 sm:p-4 space-y-1">
            {contactOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${option.color} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <option.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[#1C294E] font-semibold text-sm sm:text-base">{option.name}</p>
                  <p className="text-gray-500 text-xs sm:text-sm">{option.description}</p>
                </div>
                <Send className="w-4 h-4 text-gray-300 group-hover:text-[#079447] group-hover:translate-x-1 transition-all duration-200" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Available Mon-Fri 8am-6pm CST
            </p>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        data-chat-button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 transition-all duration-300
          bottom-4 right-4
          md:bottom-6 md:right-6
          ${isOpen
            ? 'bg-[#1C294E] scale-90 rotate-90'
            : 'bg-gradient-to-br from-[#079447] to-[#06803d] hover:scale-105 shadow-lg shadow-[#079447]/30'
          }
          text-white
          w-14 h-14 sm:w-16 sm:h-16
          rounded-full
          flex items-center justify-center
          border border-white/20`}
        aria-label="Contact us"
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
        ) : (
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
        )}
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
