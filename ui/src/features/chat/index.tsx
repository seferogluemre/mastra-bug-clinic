"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { fetchClient, API_URL } from "@/lib/api"
import { ChatSidebar } from "./components/chat-sidebar"
import { ChatArea } from "./components/chat-area"
import { Thread, Message } from "./types"

export function ChatContainer() {
    const router = useRouter()
    const [threads, setThreads] = useState<Thread[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (!token) {
            router.push("/login")
            return
        }

        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }

        loadThreads()
    }, [])

    async function loadThreads() {
        try {
            const res = await fetchClient("/api/thread-list")
            if (res.success && res.data.threads) {
                setThreads(res.data.threads)
            }
        } catch (error) {
            console.error("Failed to load threads", error)
        }
    }

    async function createNewThread(title: string) {
        try {
            const res = await fetchClient("/api/thread-list", {
                method: "POST",
                body: JSON.stringify({ title }),
            })
            if (res.success) {
                setThreads([res.data, ...threads])
                setActiveThreadId(res.data.threadId)
                setMessages([])
            }
        } catch (error) {
            console.error("Failed to create thread", error)
            toast.error("Sohbet oluşturulamadı")
        }
    }

    async function handleSendMessage(input: string) {
        if (!activeThreadId) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    message: input,
                    threadId: activeThreadId
                })
            })

            if (!response.ok) {
                throw new Error('Mesaj gönderilemedi')
            }

            if (!response.body) {
                throw new Error('Yanıt gövdesi boş')
            }

            // Create a placeholder for the assistant's message
            const botMessageId = (Date.now() + 1).toString()
            const botMessage: Message = {
                id: botMessageId,
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString()
            }
            setMessages(prev => [...prev, botMessage])

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let accumulatedContent = ''
            let lastUpdate = 0
            const THROTTLE_MS = 50 // Update every 50ms for smooth streaming

            while (true) {
                const { done, value } = await reader.read()
                if (done) {
                    // Final update to ensure all content is displayed
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    ))
                    break
                }

                const chunk = decoder.decode(value, { stream: true })
                accumulatedContent += chunk

                // Throttle updates for smoother streaming
                const now = Date.now()
                if (now - lastUpdate > THROTTLE_MS) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMessageId
                            ? { ...msg, content: accumulatedContent }
                            : msg
                    ))
                    lastUpdate = now
                }
            }
        } catch (error) {
            console.error("Failed to send message", error)
            toast.error("Bir hata oluştu.")
        } finally {
            setIsLoading(false)
        }
    }

    function handleLogout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        toast.success("Başarıyla çıkış yapıldı")
        router.push("/login")
    }

    async function handleDeleteThread(threadId: string) {
        // Optimistic update
        const updatedThreads = threads.filter(thr => thr.threadId !== threadId)
        setThreads(updatedThreads)

        if (activeThreadId === threadId) {
            setActiveThreadId(null)
            setMessages([])
        }

        try {
            await fetchClient(`/api/thread-list/${threadId}`, {
                method: "DELETE",
            })
            toast.success("Sohbet silindi")
        } catch (error) {
            console.error("Failed to delete thread", error)
            toast.error("Sohbet silinirken bir hata oluştu")
            loadThreads()
        }
    }

    function handleSelectThread(threadId: string) {
        setActiveThreadId(threadId)
        const thread = threads.find(t => t.threadId === threadId)
        if (thread?.messages) {
            setMessages(thread.messages)
        } else {
            setMessages([])
        }
    }

    const activeThread = threads.find(t => t.threadId === activeThreadId)

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <ChatSidebar
                user={user}
                threads={threads}
                activeThreadId={activeThreadId}
                onSelectThread={handleSelectThread}
                onDeleteThread={handleDeleteThread}
                onCreateThread={createNewThread}
                onLogout={handleLogout}
            />
            <ChatArea
                activeThread={activeThread}
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
            />
        </div>
    )
}
