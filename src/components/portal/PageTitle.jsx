'use client'
import { useEffect } from 'react'

export default function PageTitle({ title }) {
  useEffect(() => {
    console.log('PageTitle running with:', title)
    document.title = `${title} | Impress Cleaning Services`
    console.log('Title set to:', document.title)
  }, [title])

  return null
}