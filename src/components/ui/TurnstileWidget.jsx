'use client'
import { useEffect, useRef, useCallback } from 'react'

export default function TurnstileWidget({ onVerify, onError, onExpire, className = '' }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current !== null) return

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token) => {
          onVerify?.(token)
        },
        'expired-callback': () => {
          onExpire?.()
        },
        'error-callback': (error) => {
          console.error('Turnstile error:', error)
          onError?.(error)
        },
        theme: 'light',
        size: 'normal',
      })
    } catch (e) {
      console.error('Turnstile render error:', e)
    }
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    // Load script if not present
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad'
      script.async = true
      document.head.appendChild(script)
    }

    // Define global callback for when Turnstile is ready
    window.onTurnstileLoad = () => {
      renderWidget()
    }

    // If Turnstile already loaded, render immediately
    if (window.turnstile) {
      renderWidget()
    }

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // Widget might already be removed
        }
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ minHeight: '65px', minWidth: '300px' }}
    />
  )
}