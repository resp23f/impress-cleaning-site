'use client'
import { useEffect, useRef } from 'react'
export default function TurnstileWidget({ onVerify, onError, onExpire, className = '' }) {
const containerRef = useRef(null)
const widgetIdRef = useRef(null)
const isRenderedRef = useRef(false)
useEffect(() => {
// Load Turnstile script if not already loaded
const loadScript = () => {
if (!document.getElementById('turnstile-script')) {
const script = document.createElement('script')
script.id = 'turnstile-script'
script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
script.async = true
document.head.appendChild(script)
}
}
loadScript()
// Wait for script to load and render widget
const renderWidget = () => {
if (!window.turnstile || !containerRef.current || isRenderedRef.current) return
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
onError?.(error)
},
theme: 'light',
size: 'flexible',
})
isRenderedRef.current = true
} catch (e) {
console.error('Turnstile render error:', e)
}
}
// Check if turnstile is ready
const checkAndRender = setInterval(() => {
if (window.turnstile && containerRef.current && !isRenderedRef.current) {
renderWidget()
clearInterval(checkAndRender)
}
}, 100)
// Cleanup
return () => {
clearInterval(checkAndRender)
if (widgetIdRef.current !== null && window.turnstile) {
try {
window.turnstile.remove(widgetIdRef.current)
} catch (e) {
// Widget might already be removed
}
}
isRenderedRef.current = false
}
}, [onVerify, onError, onExpire])
return (
<div 
ref={containerRef} 
className={`turnstile-container ${className}`}
/>
)
}