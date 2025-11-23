'use client'

import { useEffect, useState } from 'react'

export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if script is already loaded
    if (window.grecaptcha) {
      setIsLoaded(true)
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const executeRecaptcha = async (action) => {
    if (!isLoaded || !window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded')
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            { action }
          )
          resolve(token)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  return { isLoaded, executeRecaptcha }
}