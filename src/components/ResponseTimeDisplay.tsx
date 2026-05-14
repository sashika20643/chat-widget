/** Temporary component – displays total response time for debugging. Remove when no longer needed. */
interface ResponseTimeDisplayProps {
  responseTimeMs: number
}

export function ResponseTimeDisplay({ responseTimeMs }: ResponseTimeDisplayProps) {
  const seconds = (responseTimeMs / 1000).toFixed(2)
  return (
    <div className="text-xs text-muted-foreground mt-1">
      Total response time: {seconds}s
    </div>
  )
}
