'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export function useTurnstile() {
  const [token, setToken] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const widgetRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => setIsReady(true)
      document.head.appendChild(script)
    } else if (window.turnstile) {
      setIsReady(true)
    }

    // Check periodically if turnstile is ready
    const checkReady = setInterval(() => {
      if (window.turnstile) {
        setIsReady(true)
        clearInterval(checkReady)
      }
    }, 100)

    return () => clearInterval(checkReady)
  }, [])

  const renderWidget = useCallback((container) => {
    if (!isReady || !window.turnstile || !container) return

    // Remove existing widget if any
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch (e) {
        // Widget might already be removed
      }
    }

    // Render new widget
    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (newToken) => {
        setToken(newToken)
      },
      'expired-callback': () => {
        setToken(null)
      },
      'error-callback': () => {
        setToken(null)
      },
      theme: 'light',
      size: 'flexible',
    })
  }, [isReady])

  const reset = useCallback(() => {
    setToken(null)
    if (widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current)
      } catch (e) {
        // Widget might not exist
      }
    }
  }, [])

  return {
    token,
    isReady,
    renderWidget,
    reset,
    widgetRef,
  }
}