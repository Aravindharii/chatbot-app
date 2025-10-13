'use client'

import { Send, Paperclip } from 'lucide-react'
import { useState } from 'react'

export default function MessageInput({
  input,
  isLoading,
  onSubmit,
  onInputChange
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <form 
      onSubmit={onSubmit}
      className={`relative flex items-end border border-gray-300 rounded-2xl bg-white transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary-500 border-primary-500 shadow-sm' : 'shadow-sm'
      }`}
    >
      {/* Attachment Button */}
      <button
        type="button"
        className="absolute left-3 bottom-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Attach files"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Textarea */}
      <textarea
        value={input}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Message AI Assistant..."
        rows="1"
        className="chat-input pr-20 resize-none max-h-32"
        disabled={isLoading}
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="send-button"
        title="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
