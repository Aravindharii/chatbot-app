'use client'

import { 
  Plus, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Trash2
} from 'lucide-react'

export default function Sidebar({ isOpen, onToggle, onNewChat }) {
  const chatHistory = [
    { id: 1, title: 'Understanding AI Ethics', date: '2024-01-15' },
    { id: 2, title: 'Python Programming Help', date: '2024-01-14' },
    { id: 3, title: 'Project Ideas Discussion', date: '2024-01-13' },
    { id: 4, title: 'Learning Resources', date: '2024-01-12' },
  ]

  // Helper: format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 text-white flex flex-col transition-transform duration-300 z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={onNewChat}
            className="flex items-center gap-3 p-3 w-full border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <Plus className="w-5 h-5" />
            <span>New chat</span>
          </button>
          
          <button
            onClick={onToggle}
            className="p-2 ml-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {chat.title}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(chat.date)}
                </p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all">
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              User Account
            </p>
            <p className="text-xs text-gray-400 truncate">
              Free Plan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
