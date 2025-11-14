'use client';  // ADD THIS LINE AT THE TOP - THIS IS CRITICAL!

import { useEffect } from 'react';

export default function TawkToChat() {
  useEffect(() => {
    // Replace with your actual Tawk.to property ID and widget ID
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    (function() {
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      
      s1.async = true;
      // Replace YOUR_PROPERTY_ID and YOUR_WIDGET_ID with actual values from Tawk.to
      s1.src = 'https://embed.tawk.to/6917958e9df3a4195770cf89/1ja220dab';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      
      s0.parentNode.insertBefore(s1, s0);
    })();

    // Hide the default Tawk.to bubble since you have your own
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function() {
      if (window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);

  return null;
}













































