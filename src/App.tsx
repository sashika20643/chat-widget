import ChatWidget from '@/components/ChatWidget'
import { InactivityNotificationExample } from '@/components/examples/InactivityNotificationExample'
import { ProductDwellNotificationExample } from '@/components/examples/ProductDwellNotificationExample'

function App() {
  function handleSendMessage(message: string) {
    console.log('Message sent:', message)
    // Handle message sending logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Chat Widget App</h1>
            <p className="text-muted-foreground text-lg">
              A lightweight, embeddable React application that provides an interactive chat interface
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Welcome</h2>
            <p className="text-muted-foreground">
              This is a demo page for the Chat Widget component. The chat widget appears in the bottom-right corner.
              Click on it to start a conversation!
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                The widget is designed to be:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Lightweight and embeddable</li>
                <li>Maintainable and scalable</li>
                <li>Modular and customizable</li>
              </ul>
            </div>
          </div>

          <InactivityNotificationExample />
          <ProductDwellNotificationExample />
        </div>
      </div>
      
      <ChatWidget 
        title="Chat Support"
        placeholder="Type your message..."
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}

export default App
