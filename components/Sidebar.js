'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  User,
  Settings,
  LogOut,
  Search,
  X
} from 'lucide-react'

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  onSelectChat,
  currentChatId 
}) {
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Construction Materials Query', date: '2024-01-15', preview: 'Looking for cement suppliers in Thrissur' },
    { id: 2, title: 'Architect Services', date: '2024-01-14', preview: 'Need architectural design for residential project' },
    { id: 3, title: 'Steel Suppliers Discussion', date: '2024-01-13', preview: 'Comparing TMT steel bar prices' },
    { id: 4, title: 'Building Materials', date: '2024-01-12', preview: 'Research on sustainable construction materials' },
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(null)

  // Filter chats based on search
  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper: format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Handle chat deletion
  const handleDeleteChat = async (chatId, event) => {
    event.stopPropagation()
    
    setIsDeleting(chatId)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    setIsDeleting(null)
    
    // If deleted chat was currently selected, clear selection
    if (currentChatId === chatId) {
      onSelectChat(null)
    }
  }

  // Handle chat selection
  const handleSelectChat = (chat) => {
    onSelectChat(chat.id)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
  }

  // Add new chat to history
  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Conversation',
      date: new Date().toISOString().split('T')[0],
      preview: 'Start a new conversation...'
    }
    setChatHistory(prev => [newChat, ...prev])
    onNewChat()
    onSelectChat(newChat.id)
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && isOpen) {
        const sidebar = document.querySelector('.sidebar')
        if (sidebar && !sidebar.contains(event.target)) {
          onToggle()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  // Collapsed State
  if (!isOpen) {
    return (
      <div className="fixed left-0 top-0 h-full z-40">
        <button
          onClick={onToggle}
          className="m-4 p-3 bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:bg-gray-750 transition-all duration-300 hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    )
  }

  return (
    <div className="sidebar fixed left-0 top-0 h-full w-80 bg-gray-900 text-white flex flex-col transition-transform duration-300 z-40 border-r border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            BuildAssist AI
          </h1>
          <button
            onClick={onToggle}
            className="p-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all duration-200 hover:border-gray-600"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <button
          onClick={handleNewChat}
          className="flex items-center gap-3 p-3 w-full border border-gray-700 rounded-xl hover:bg-gray-800 transition-all duration-200 group hover:border-blue-500/50 bg-gradient-to-r from-gray-800 to-gray-850"
        >
          <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
            <Plus className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-medium text-gray-200">New Construction Query</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-800 bg-gray-900/90">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations found</p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group border ${
                    currentChatId === chat.id
                      ? 'bg-blue-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'border-transparent hover:bg-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    currentChatId === chat.id
                      ? 'bg-blue-500/30'
                      : 'bg-gray-800 group-hover:bg-gray-750'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${
                      currentChatId === chat.id ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      currentChatId === chat.id ? 'text-blue-300' : 'text-gray-200'
                    }`}>
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {chat.preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(chat.date)}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    disabled={isDeleting === chat.id}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDeleting === chat.id
                        ? 'text-red-400 bg-red-500/20'
                        : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/95">
        <div 
          className="relative"
          onMouseEnter={() => setShowUserMenu(true)}
          onMouseLeave={() => setShowUserMenu(false)}
        >
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                Construction Manager
              </p>
              <p className="text-xs text-gray-400 truncate">
                Professional Plan
              </p>
            </div>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              <button className="flex items-center gap-3 w-full p-3 text-sm text-gray-200 hover:bg-gray-750 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </button>
              <button className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}