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

      // Track when chat is maximized (opened)
      window.Tawk_API.onChatMaximized = function() {
        const customButton = document.querySelector('[data-chat-button]');
        if (customButton) {
          customButton.style.display = 'none';
        }
        
        const contactMenu = document.querySelector('[data-contact-menu]');
        if (contactMenu) {
          contactMenu.style.display = 'none';
        }
        
        const backdrop = document.querySelector('[data-contact-backdrop]');
        if (backdrop) {
          backdrop.click();
        }
      };

      // Track when chat is minimized (closed)
      window.Tawk_API.onChatMinimized = function() {
        const customButton = document.querySelector('[data-chat-button]');
        if (customButton) {
          customButton.style.display = 'block';
        }
        
        const contactMenu = document.querySelector('[data-contact-menu]');
        if (contactMenu) {
          contactMenu.style.display = 'block';
        }
      };

      // Remove fake notification badge - only show for real visitor messages
      window.Tawk_API.onUnreadCountChanged = function(count) {
        // Clear any unread count if there's no active chat
        if (count > 0 && !window.Tawk_API.isChatOngoing()) {
          // Force clear the badge by setting count to 0
          window.Tawk_API.setUnreadCount?.(0);
        }
      };

      // Also clear on page load if there's no active chat
      setTimeout(() => {
        if (!window.Tawk_API.isChatOngoing()) {
          window.Tawk_API.setUnreadCount?.(0);
        }
      }, 1000);
    };
  }, []);

  return null;
}