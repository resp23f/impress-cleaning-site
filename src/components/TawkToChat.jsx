'use client';

import { useEffect } from 'react';

export default function TawkToChat() {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    (function() {
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      
      s1.async = true;
      s1.src = 'https://embed.tawk.to/6917958e9df3a4195770cf89/1ja220dab';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      
      s0.parentNode.insertBefore(s1, s0);
    })();

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function() {
      // Hide the default widget since you have your own chat button
      if (window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }

      // ✅ NEW: Track when chat is maximized (opened)
      window.Tawk_API.onChatMaximized = function() {
        // Hide custom chat button when Tawk widget opens
        const customButton = document.querySelector('[data-chat-button]');
        if (customButton) {
          customButton.style.display = 'none';
        }
      };

      // ✅ NEW: Track when chat is minimized (closed)
      window.Tawk_API.onChatMinimized = function() {
        // Show custom chat button again when Tawk widget closes
        const customButton = document.querySelector('[data-chat-button]');
        if (customButton) {
          customButton.style.display = 'block';
        }
      };

      // ✅ FIX: Remove the fake "1 new message" notification badge
      window.Tawk_API.onUnreadCountChanged = function(count) {
        // Only show unread count if there's an actual ongoing conversation
        if (!window.Tawk_API.isChatOngoing()) {
          // Reset unread count display in browser tab
          document.title = document.title.replace(/^\(\d+\)\s*/, '');
        }
      };
    };
  }, []);

  return null;
}