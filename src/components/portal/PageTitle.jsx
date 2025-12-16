'use client'
import { useEffect } from 'react'

export default function PageTitle({ title }) {
  useEffect(() => {
    // Run after Next.js hydration completes
    requestAnimationFrame(() => {
      document.title = `${title} | Impress Cleaning Services`
    })
  }, [title])

  return null
}