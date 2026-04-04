import React, { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useActivityLogger } from '../hooks/useActivityLogger'
import { chatWithAI } from '../services/api'

const LANGUAGES = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Odia', 'Urdu', 'Assamese']

const QUICK_PROMPTS = [
  { icon: '🌾', text: 'What crop should I grow?' },
  { icon: '🏛️', text: 'Tell me about PM-KISAN' },
  { icon: '🍃', text: 'My plant has yellow spots' },
  { icon: '🌿', text: 'Best fertilizer for wheat' },
  { icon: '💰', text: 'Government loan schemes' },
  { icon: '🌱', text: 'Organic farming tips' },
]

export default function AssistantPage() {
  const { userProfile } = useAuth()
  const { logActivity } = useActivityLogger()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const firstName = userProfile?.fullName?.split(' ')[0] || 'Farmer'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await chatWithAI(newMessages, language)
      const assistantMsg = { role: 'assistant', content: res.data.response }
      setMessages(prev => [...prev, assistantMsg])
      logActivity('chat', text.slice(0, 80), '', { language, response: res.data.response.slice(0, 200) })
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, I could not process your request. Please check your API configuration.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (input.trim() && !loading) sendMessage(input.trim())
  }

  return (
    <Layout>
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hi, <span className="text-green-600">{firstName}!</span></h1>
            <p className="text-gray-500 text-sm">Your smart farming assistant — ask anything</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
            <button
              onClick={() => setMessages([])}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm mb-4 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl mb-3">🌾</div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">AgriSmart AI Assistant</h2>
              <p className="text-gray-500 text-sm text-center mb-8 max-w-xs">
                Your AI farming expert — ask about crops, weather, diseases, schemes &amp; more.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p.text}
                    onClick={() => sendMessage(p.text)}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-300 border border-gray-200 text-left transition-colors"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
                  )}
                  <div
                    className={`max-w-lg px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#111827' }}>
          <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
            <button type="button" className="text-gray-400 hover:text-white text-lg">+</button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
            />
            <button type="button" className="text-gray-400 hover:text-white text-lg">🎤</button>
            <button type="button" className="text-gray-400 hover:text-white text-lg">📎</button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              ▶
            </button>
          </form>
          <p className="text-center text-gray-600 text-xs pb-2">🌿 AgriSmart AI · Supports voice, images &amp; files</p>
        </div>
      </div>
    </Layout>
  )
}
