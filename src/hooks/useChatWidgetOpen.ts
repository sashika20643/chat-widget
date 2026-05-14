import { useEffect, useRef } from 'react'

const DESKTOP_BREAKPOINT_PX = 1500
const MAIN_CONTENT_SELECTORS = [
  'main',
  '#content',
  '[role="main"]',
  '.main-content',
  '.content',
  'article',
]

function findHostMainContent(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  const container = document.getElementById('chatbot-widget-container')
  for (const sel of MAIN_CONTENT_SELECTORS) {
    const el = document.querySelector(sel)
    if (el && el !== container && !container?.contains(el)) return el as HTMLElement
  }
  const first = document.body?.firstElementChild
  if (
    first &&
    first !== container &&
    (first as HTMLElement).id !== 'chatbot-widget-container'
  )
    return first as HTMLElement
  return null
}

/**
 * Syncs widget open state to document (body attribute, events, host main content shrink on desktop).
 */
export function useChatWidgetOpen(isOpen: boolean): void {
  const mainContentElRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const isDesktop = () =>
      window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`).matches

    if (isOpen) {
      document.body.setAttribute('data-chat-open', 'true')
      window.dispatchEvent(new CustomEvent('chat-widget-open'))
      if (isDesktop()) {
        const candidate = findHostMainContent()
        if (candidate) {
          candidate.classList.add('chat-widget-main-shrink')
          mainContentElRef.current = candidate
        }
      }
    } else {
      document.body.removeAttribute('data-chat-open')
      window.dispatchEvent(new CustomEvent('chat-widget-close'))
      if (mainContentElRef.current) {
        mainContentElRef.current.classList.remove('chat-widget-main-shrink')
        mainContentElRef.current = null
      }
    }

    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`)
    const handleChange = () => {
      if (!isOpen) return
      if (!mql.matches && mainContentElRef.current) {
        mainContentElRef.current.classList.remove('chat-widget-main-shrink')
        mainContentElRef.current = null
      }
      if (mql.matches && !mainContentElRef.current) {
        const candidate = findHostMainContent()
        if (candidate) {
          candidate.classList.add('chat-widget-main-shrink')
          mainContentElRef.current = candidate
        }
      }
    }
    mql.addEventListener('change', handleChange)

    return () => {
      document.body.removeAttribute('data-chat-open')
      if (mainContentElRef.current) {
        mainContentElRef.current.classList.remove('chat-widget-main-shrink')
        mainContentElRef.current = null
      }
      mql.removeEventListener('change', handleChange)
    }
  }, [isOpen])
}
