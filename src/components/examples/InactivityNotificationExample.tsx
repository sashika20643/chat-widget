import { triggerInactivityNotification } from '@/utils/chatWidgetNotifications'

export function InactivityNotificationExample() {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-3">
      <h3 className="text-lg font-semibold">Example Page A: Inactivity Notification</h3>
      <p className="text-sm text-muted-foreground">
        Simulates a generic inactivity event. This opens the existing inactivity suggestion notification.
      </p>
      <button
        type="button"
        onClick={triggerInactivityNotification}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
      >
        Trigger Inactivity Notification
      </button>
    </div>
  )
}

