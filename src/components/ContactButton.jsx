'use client';

import { useState } from 'react';
import { X, MessageCircle, Phone, Mail, MessageSquare } from 'lucide-react';

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      name: 'Live Chat',
      icon: MessageCircle,
      action: () => {
        // Add your live chat integration here
        console.log('Open live chat');
      }
    },
    {
      name: 'Text Us',
      icon: MessageSquare,
      action: () => {
        window.open('sms:+15122775364', '_blank'); // Replace with your phone number
      }
    },
    {
      name: 'Call Us',
      icon: Phone,
      action: () => {
        window.location.href = 'tel:+15122775364'; // Replace with your phone number
      }
    },
    {
      name: 'Email Us',
      icon: Mail,
      action: () => {
        window.location.href = 'mailto:admin@impressyoucleaning.com'; // Replace with your email
      }
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contact Options Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white rounded-lg shadow-xl z-50 w-64 overflow-hidden">
          <div className="p-4 bg-green-600 text-white font-semibold">
            Get In Touch
          </div>
          <div className="py-2">
            {contactOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors"
              >
                <option.icon className="w-5 h-5 text-green-600" />
                <span className="text-gray-800 font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
        aria-label="Contact us"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}