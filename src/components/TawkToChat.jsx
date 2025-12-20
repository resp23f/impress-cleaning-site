'use client';
import { useEffect, useRef } from 'react';

// {Tawk.to live chat - ONLY on public marketing pages}
export default function TawkToChat() {
  const intervalRef = useRef(null);
  const styleRef = useRef(null);

  useEffect(() => {
    const TAWK_SCRIPT_ID = 'tawk-to-script';
    const TAWK_STYLE_ID = 'tawk-hide-style';
    
    // Don't re-initialize if already loaded
    if (document.getElementById(TAWK_SCRIPT_ID)) return;

    // Inject CSS to hide Tawk's native button (bulletproof fallback)
    if (!document.getElementById(TAWK_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = TAWK_STYLE_ID;
      style.textContent = `
        .tawk-min-container,
        .tawk-button-circle,
        [class*="tawk-min"],
        iframe[title="chat widget button"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = 'https://embed.tawk.to/6917958e9df3a4195770cf89/1ja220dab';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);

    window.Tawk_API.onLoad = function() {
      // Hide widget by default
      const hideWidget = () => {
        if (window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget();
        }
      };
      hideWidget();
      setTimeout(hideWidget, 100);
      setTimeout(hideWidget, 500);
      setTimeout(hideWidget, 1000);
      setTimeout(hideWidget, 2000);

      // Clear tab badge
      const clearTabBadge = () => {
        if (document.title.match(/^\(\d+\)/)) {
          document.title = document.title.replace(/^\(\d+\)\s*/, '');
        }
      };
      clearTabBadge();
      intervalRef.current = setInterval(clearTabBadge, 2000);

      // Chat maximize handler
      window.Tawk_API.onChatMaximized = function() {
        const customButton = document.querySelector('[data-chat-button]');
        if (customButton) customButton.style.display = 'none';
        const contactMenu = document.querySelector('[data-contact-menu]');
        if (contactMenu) contactMenu.style.display = 'none';
        const backdrop = document.querySelector('[data-contact-backdrop]');
        if (backdrop) backdrop.click();
      };

      // Chat minimize handler - re-hide Tawk's button
      window.Tawk_API.onChatMinimized = function() {
        const customButton = document.querySelector('[data-chat-button]');
        if (customButton) customButton.style.display = 'block';
        const contactMenu = document.querySelector('[data-contact-menu]');
        if (contactMenu) contactMenu.style.display = 'block';
        // Re-hide Tawk's native button
        if (window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget();
        }
      };

      // Unread count handler
      window.Tawk_API.onUnreadCountChanged = function(count) {
        if (count > 0 && !window.Tawk_API?.isChatOngoing?.()) {
          window.Tawk_API?.setUnreadCount?.(0);
        }
      };

      setTimeout(() => {
        if (!window.Tawk_API?.isChatOngoing?.()) {
          window.Tawk_API?.setUnreadCount?.(0);
        }
      }, 1000);
    };

    // Cleanup on unmount (SPA navigation away from public pages)
    return () => {
      // Clear the tab badge interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Remove injected style
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }

      // Remove Tawk script
      const tawkScript = document.getElementById(TAWK_SCRIPT_ID);
      if (tawkScript) tawkScript.remove();

      // Remove Tawk style
      const tawkStyle = document.getElementById(TAWK_STYLE_ID);
      if (tawkStyle) tawkStyle.remove();

      // Remove all Tawk iframes
      document.querySelectorAll('iframe[src*="tawk.to"]').forEach(el => el.remove());

      // Remove Tawk widget containers
      document.querySelectorAll('[class*="tawk"], [id*="tawk"]').forEach(el => el.remove());

      // Clear Tawk globals
      if (window.Tawk_API) delete window.Tawk_API;
      if (window.Tawk_LoadStart) delete window.Tawk_LoadStart;
    };
  }, []);

  return null;
}
