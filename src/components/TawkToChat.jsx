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
      // Multiple attempts to hide widget with delays
      const hideWidget = () => {
        if (window.Tawk_API && window.Tawk_API.hideWidget) {
          window.Tawk_API.hideWidget();
        }
      };
      hideWidget();
      setTimeout(hideWidget, 100);
      setTimeout(hideWidget, 500);
      setTimeout(hideWidget, 1000);
      const clearTabBadge = () => {
        if (document.title.match(/^\(\d+\)/)) {
          document.title = document.title.replace(/^\(\d+\)\s*/, '');
        }
      };
      clearTabBadge();
      setInterval(clearTabBadge, 2000); // Check every 2 seconds
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
      window.Tawk_API.onUnreadCountChanged = function(count) {
        if (count > 0 && !window.Tawk_API.isChatOngoing()) {
          window.Tawk_API.setUnreadCount?.(0);
        }
      };
      setTimeout(() => {
        if (!window.Tawk_API.isChatOngoing()) {
          window.Tawk_API.setUnreadCount?.(0);
        }
      }, 1000);
    };
  }, []);
  return null;
}