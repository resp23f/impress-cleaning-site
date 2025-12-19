'use client'
import { useEffect, useRef } from 'react'

export default function TurnstileWidget({ onVerify, onError, onExpire, className = '' }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const callbacksRef = useRef({ onVerify, onError, onExpire })

  // Update callbacks ref without triggering re-renders
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire }
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    let mounted = true

    const renderWidget = () => {
      if (!mounted || !window.turnstile || !containerRef.current) return
      if (widgetIdRef.current !== null) return

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token) => {
            callbacksRef.current.onVerify?.(token)
          },
          'expired-callback': () => {
            callbacksRef.current.onExpire?.()
          },
          'error-callback': (error) => {
            callbacksRef.current.onError?.(error)
          },
          theme: 'light',
          size: 'flexible',
        })
      } catch (e) {
        // Silent fail - widget will retry
      }
    }

    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = renderWidget
      document.head.appendChild(script)
    } else if (window.turnstile) {
      renderWidget()
    }

    return () => {
      mounted = false
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {}
        widgetIdRef.current = null
      }
    }
  }, [])

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        ref={containerRef}
        className="[&>iframe]:rounded-lg [&>iframe]:shadow-sm"
        style={{
          minHeight: '65px',
          width: '100%',
          maxWidth: '300px',
        }}
      />
    </div>
  )
}