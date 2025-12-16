'use client'
import { useEffect } from 'react'

export default function PageTitle({ title }) {
  useEffect(() => {
    document.title = `${title} | Impress Cleaning Services`
  }, [title])

  return null
}