"use client"

import { useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MessageSquare, LogOut, Send, User, Bot } from "lucide-react"
import { fetchClient, API_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Thread {
    threadId: string
    title: string
    createdAt: string
}

export default function ChatPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [threads, setThreads] = useState<Thread[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [user, setUser] = useState<{ name: string; email: string } | null>(null)

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

    async function createNewThread() {
        try {
            const res = await fetchClient("/api/thread-list", {
                method: "POST",
                body: JSON.stringify({ title: "Yeni Sohbet" }),
            })
            if (res.success) {
                setThreads([res.data, ...threads])
                setActiveThreadId(res.data.threadId)
                // Clear chat messages if needed
            }
        } catch (error) {
            console.error("Failed to create thread", error)
        }
    }

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: `${API_URL}/api/chat`,
        body: {
            threadId: activeThreadId,
        },
        headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
        },
        onResponse: (response: Response) => {
            if (response.status === 401) {
                router.push("/login")
            }
        },
        onError: (error: Error) => {
            console.error("Chat error", error)
        },
    })

    function handleLogout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h1 className="font-bold text-xl text-gray-800 dark:text-white">Mastra AI</h1>
                    <Button variant="ghost" size="icon" onClick={createNewThread}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {threads.map((thread) => (
                            <Button
                                key={thread.threadId}
                                variant={activeThreadId === thread.threadId ? "secondary" : "ghost"}
                                className="w-full justify-start text-left truncate"
                                onClick={() => setActiveThreadId(thread.threadId)}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span className="truncate">{thread.title || "Yeni Sohbet"}</span>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeThreadId ? (
                    <>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "flex w-full",
                                            m.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex max-w-[80%] rounded-lg p-4",
                                                m.role === "user"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                            )}
                                        >
                                            <div className="mr-2 mt-1">
                                                {m.role === "user" ? (
                                                    <User className="h-4 w-4" />
                                                ) : (
                                                    <Bot className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="whitespace-pre-wrap">{m.content}</div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start w-full">
                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center">
                                            <Bot className="mr-2 h-4 w-4 animate-pulse" />
                                            <span className="text-sm text-gray-500">Yazıyor...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Mesajınızı yazın..."
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={isLoading}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>Bir sohbet seçin veya yeni bir tane başlatın.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
