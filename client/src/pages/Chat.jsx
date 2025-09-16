import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Chat = () => {
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchSuggestions()
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Welcome to the Fallout 76 AI Assistant! I'm here to help you with builds, items, locations, and strategies. Ask me anything about the wasteland!",
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/chat/suggestions')
      setSuggestions(response.data.suggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return

    if (!isAuthenticated) {
      toast.error('Please login to use the AI chat')
      return
    }

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post('/chat/message', {
        message: messageText,
        conversationHistory: messages.slice(-10) // Send last 10 messages for context
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        relevantData: response.data.relevantData
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    sendMessage(suggestion)
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. How can I help you today?",
      timestamp: new Date()
    }])
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="pip-card mb-6">
        <h1 className="pip-header">AI WASTELAND ASSISTANT</h1>
        <p className="pip-text-dim text-center">
          Get help with builds, items, locations, and strategies from our RAG-powered AI
        </p>
      </div>

      {!isAuthenticated && (
        <div className="pip-card mb-6">
          <div className="p-4 border border-pip-amber-500 rounded bg-pip-amber-500 bg-opacity-10">
            <p className="pip-text text-pip-amber-400 text-center">
              🔐 Please <a href="/auth" className="underline">login or create an account</a> to use the AI chat assistant
            </p>
          </div>
        </div>
      )}

      <div className="pip-card">
        {/* Chat Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="pip-text font-bold">CHAT SESSION</h2>
          <button
            onClick={clearChat}
            className="pip-button text-sm"
            disabled={!isAuthenticated}
          >
            CLEAR CHAT
          </button>
        </div>

        {/* Messages */}
        <div className="pip-screen p-4 h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded ${
                  message.role === 'user'
                    ? 'bg-pip-green-600 bg-opacity-20 border border-pip-green-600'
                    : message.isError
                    ? 'bg-red-500 bg-opacity-20 border border-red-500'
                    : 'bg-crt-darker border border-pip-green-700'
                }`}
              >
                <div className="pip-text text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
                <div className="pip-text-dim text-xs mt-2 flex justify-between items-center">
                  <span>{message.role === 'user' ? 'You' : 'AI Assistant'}</span>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                </div>
                {message.relevantData && (
                  <div className="pip-text-dim text-xs mt-1 pt-2 border-t border-pip-green-700">
                    📊 Found {message.relevantData.items} items, {message.relevantData.builds} builds
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-crt-darker border border-pip-green-700 px-4 py-2 rounded max-w-xs">
                <div className="pip-loading">AI is thinking</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={isAuthenticated ? "Ask about builds, items, locations..." : "Login to chat"}
              className="pip-input flex-1"
              disabled={!isAuthenticated || loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !isAuthenticated || loading}
              className="pip-button primary"
            >
              {loading ? '...' : 'SEND'}
            </button>
          </div>

          {/* Suggestions */}
          {isAuthenticated && suggestions.length > 0 && (
            <div>
              <p className="pip-text-dim text-sm mb-2">💡 Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="pip-button text-xs"
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Info */}
      <div className="pip-card mt-6">
        <h3 className="pip-text font-bold mb-3">🤖 AI CAPABILITIES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="pip-text text-sm font-bold mb-2">What I can help with:</h4>
            <ul className="pip-text-dim text-xs space-y-1">
              <li>✅ Character build optimization</li>
              <li>✅ SPECIAL stat allocation</li>
              <li>✅ Perk card recommendations</li>
              <li>✅ Weapon and armor suggestions</li>
              <li>✅ Location and quest guidance</li>
              <li>✅ Farming strategies</li>
            </ul>
          </div>
          <div>
            <h4 className="pip-text text-sm font-bold mb-2">Powered by:</h4>
            <ul className="pip-text-dim text-xs space-y-1">
              <li>🧠 Google Gemini AI</li>
              <li>📚 RAG (Retrieval-Augmented Generation)</li>
              <li>🗄️ Live game database</li>
              <li>📖 Community build knowledge</li>
              <li>🌐 Wiki data integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat