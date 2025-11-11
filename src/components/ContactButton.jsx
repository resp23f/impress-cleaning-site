'use client';

import { useState } from 'react';
import { X, MessageCircle, Phone, Mail, MessageSquare, HelpCircle } from 'lucide-react';

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      name: 'Chat with us',
      icon: MessageCircle,
      action: () => {
        // Add your live chat integration here
        console.log('Open live chat');
      }
    },
    {
      name: 'Call us',
      icon: Phone,
      action: () => {
        window.location.href = 'tel:+1234567890'; // Replace with your phone number
      }
    },
    {
      name: 'Email us',
      icon: Mail,
      action: () => {
        window.location.href = 'mailto:info@impresscleaning.com'; // Replace with your email
      }
    },
    {
      name: 'Help center',
      icon: HelpCircle,
      action: () => {
        window.location.href = '/faq'; // Change to your help center page URL
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
        className="fixed inset-0 bg-transparent z-40"
        onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contact Options Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 bg-white rounded-3xl shadow-2xl z-50 w-[90%] max-w-md p-6">
          {/* Header with Close Button */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h2>
              <p className="text-lg text-gray-600">How can we help you?</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-900 -mt-1"
              aria-label="Close"
            >
              <X className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            {contactOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="w-full px-6 py-4 flex items-center gap-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <option.icon className="w-7 h-7 text-green-700" strokeWidth={2} />
                </div>
                <span className="text-xl font-medium text-gray-900">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-green-700 hover:bg-green-800 text-white p-5 rounded-full shadow-2xl z-50 transition-all duration-300 hover:scale-110"
        aria-label="Contact us"
      >
        <MessageCircle className="w-7 h-7" strokeWidth={2} />
      </button>
    </>
  );
}