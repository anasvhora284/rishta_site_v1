import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://rishta-group-68-samaj.netlify.app'

interface RouteSeoProps {
  children: ReactNode
  description: string
  indexable?: boolean
  title: string
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = content
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = href
}

export default function RouteSeo({
  children,
  description,
  indexable = false,
  title,
}: RouteSeoProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${pathname}`

    document.title = title
    setCanonical(canonicalUrl)
    setMeta('name', 'description', description)
    setMeta('name', 'robots', indexable ? 'index, follow' : 'noindex, nofollow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
  }, [description, indexable, pathname, title])

  return children
}
