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
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad'
      script.async = true
      document.head.appendChild(script)
    }

    window.onTurnstileLoad = () => {
      renderWidget()
    }

    if (window.turnstile) {
      renderWidget()
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {}
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  return (
    <div 
      className={className}
      style={{
        width: '100%',
        minHeight: '65px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div 
        ref={containerRef}
        style={{ 
          minHeight: '65px',
          minWidth: '300px',
        }}
      />
    </div>
  )
}