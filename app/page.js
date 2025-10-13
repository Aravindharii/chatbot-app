'use client'

import { useChat } from '../hooks/useChat'
import ChatContainer from '../components/ChatContainer'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'

export default function Home() {
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    clearMessages,
  } = useChat()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={clearMessages}
      />
      
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-80' : 'ml-0'} transition-all duration-300`}>
        <ChatContainer
          messages={messages}
          input={input}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
        />
      </div>
    </div>
  )
}
