"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { pusherClient } from "@/lib/pusher"

interface Message {
  id: string
  content: string
  userId: string
  businessId: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface ChatProps {
  businessId: string
}

export default function Chat({ businessId }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Mevcut mesajları yükle
    fetch(`/api/messages?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))

    // Pusher kanalına abone ol
    const channel = pusherClient.subscribe(`chat-${businessId}`)
    channel.bind('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      pusherClient.unsubscribe(`chat-${businessId}`)
    }
  }, [businessId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session?.user) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          businessId,
        }),
      })

      if (!response.ok) throw new Error('Mesaj gönderilemedi')
      
      setNewMessage("")
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user.id === session?.user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.user.id === session?.user?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm font-semibold">{message.user.name}</p>
              <p>{message.content}</p>
              <p className="text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  )
} 