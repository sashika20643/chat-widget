import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  text: string
  /** Delay in ms per character. Default 30. */
  speed?: number
  className?: string
  onComplete?: () => void
  children?: (visibleText: string) => React.ReactNode
}

export function TypewriterText({
  text,
  speed = 30,
  className,
  onComplete,
  children,
}: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
    if (text.length > 0 && visibleLength >= text.length && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
  }, [text.length, visibleLength, onComplete])

  useEffect(() => {
    if (text.length < visibleLength) {
      setVisibleLength(text.length)
    }
    if (visibleLength < text.length) completedRef.current = false
  }, [text.length, visibleLength])

  useEffect(() => {
    const id = setInterval(() => {
      setVisibleLength((prev) => (prev >= text.length ? prev : prev + 1))
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  const visibleText = text.slice(0, visibleLength)

  if (children) return <>{children(visibleText)}</>
  return <span className={className}>{visibleText}</span>
}
