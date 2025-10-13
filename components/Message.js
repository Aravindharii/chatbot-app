'use client'

import { User, Bot } from 'lucide-react'

export default function Message({ message }) {
  const isUser = message.role === 'user'
  const isError = message.isError

  return (
    <div className={`message-${isUser ? 'user' : 'assistant'} py-6 px-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary-500' : 'bg-green-500'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">
                {isUser ? 'You' : 'Assistant'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {isError && (
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                  Error
                </span>
              )}
            </div>
            
            <div className={`prose prose-sm max-w-none ${
              isError ? 'text-red-700' : 'text-gray-700'
            }`}>
              {message.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
