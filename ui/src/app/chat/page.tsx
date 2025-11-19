"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MessageSquare, LogOut, Send, User, Bot, MoreVertical } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
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

    // New Thread Dialog State
    const [isNewThreadDialogOpen, setIsNewThreadDialogOpen] = useState(false)
    const [newThreadTitle, setNewThreadTitle] = useState("")
    const [isCreatingThread, setIsCreatingThread] = useState(false)

    // Auth check
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

    async function createNewThread(e: React.FormEvent) {
        e.preventDefault()
        if (!newThreadTitle.trim()) return

        setIsCreatingThread(true)
        try {
            const res = await fetchClient("/api/thread-list", {
                method: "POST",
                body: JSON.stringify({ title: newThreadTitle }),
            })
            if (res.success) {
                setThreads([res.data, ...threads])
                setActiveThreadId(res.data.threadId)
                setIsNewThreadDialogOpen(false)
                setNewThreadTitle("")
            }
        } catch (error) {
            console.error("Failed to create thread", error)
        } finally {
            setIsCreatingThread(false)
        }
    }

    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; createdAt?: string }[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || !activeThreadId) return

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: input,
            createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetchClient("/api/chat", {
                method: "POST",
                body: JSON.stringify({
                    message: userMessage.content,
                    threadId: activeThreadId
                })
            })

            if (res.success && res.data.message) {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: res.data.message,
                    createdAt: new Date().toISOString()
                }
                setMessages(prev => [...prev, botMessage])
            } else {
                console.error("Chat response error:", res.error)
                toast.error("Mesaj gönderilemedi: " + res.error)
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

    const activeThread = threads.find(t => t.threadId === activeThreadId)

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h1 className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Mastra AI</h1>

                    <Dialog open={isNewThreadDialogOpen} onOpenChange={setIsNewThreadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yeni Sohbet Başlat</DialogTitle>
                                <DialogDescription>
                                    Sohbetiniz için bir başlık belirleyin.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={createNewThread}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="title" className="text-right">
                                            Başlık
                                        </Label>
                                        <Input
                                            id="title"
                                            value={newThreadTitle}
                                            onChange={(e) => setNewThreadTitle(e.target.value)}
                                            className="col-span-3"
                                            placeholder="Örn: Hasta Randevusu"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isCreatingThread}>
                                        {isCreatingThread ? "Oluşturuluyor..." : "Oluştur"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {threads.map((thread) => (
                            <Button
                                key={thread.threadId}
                                variant={activeThreadId === thread.threadId ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start text-left truncate transition-colors",
                                    activeThreadId === thread.threadId ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                                onClick={() => {
                                    setActiveThreadId(thread.threadId)
                                    // Load messages from the thread object if available
                                    if (thread.messages) {
                                        setMessages(thread.messages)
                                    } else {
                                        setMessages([])
                                    }
                                }}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span className="truncate font-medium">{thread.title || "Yeni Sohbet"}</span>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center mb-4">
                        <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-gray-800">
                            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors dark:border-gray-700 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                                <LogOut className="mr-2 h-4 w-4" />
                                Çıkış Yap
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Çıkış Yapmak İstediğinize Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Oturumunuz sonlandırılacak ve giriş ekranına yönlendirileceksiniz.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                                    Çıkış Yap
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                {activeThreadId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
                            <div className="flex items-center">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl mr-3 shadow-sm">
                                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white leading-tight">
                                        {activeThread?.title || "Sohbet"}
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {activeThread?.createdAt ? new Date(activeThread.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4 sm:p-6">
                            <div className="space-y-6 max-w-3xl mx-auto">
                                {messages.map((m, index) => {
                                    const showDateSeparator = index === 0 ||
                                        new Date(messages[index - 1].createdAt || Date.now()).toDateString() !== new Date(m.createdAt || Date.now()).toDateString();

                                    return (
                                        <div key={m.id} className="w-full flex flex-col">
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-4">
                                                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full shadow-sm">
                                                        {new Date(m.createdAt || Date.now()).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            weekday: 'long'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                    m.role === "user" ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm",
                                                        m.role === "user"
                                                            ? "bg-blue-600 text-white rounded-br-none"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"
                                                    )}
                                                >
                                                    <div className="mr-3 mt-0.5 opacity-80">
                                                        {m.role === "user" ? (
                                                            <User className="h-4 w-4" />
                                                        ) : (
                                                            <Bot className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                                                        {typeof m.content === 'string' ? (
                                                            m.content
                                                        ) : (
                                                            <span className="italic text-gray-500">
                                                                {/* Handle tool calls or other non-string content */}
                                                                {(m.content as any)?.toolName ? `Tool used: ${(m.content as any).toolName}` : JSON.stringify(m.content)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {isLoading && (
                                    <div className="flex justify-start w-full animate-in fade-in duration-300">
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none p-4 flex items-center shadow-sm">
                                            <Bot className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                                            <span className="text-sm text-gray-500 font-medium">Yazıyor...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3 items-center">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Mesajınızı yazın..."
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className={cn(
                                        "bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all",
                                        (isLoading || !input.trim()) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Hoş Geldiniz!</h3>
                        <p className="text-sm max-w-xs text-center">Sol menüden mevcut bir sohbeti seçin veya yeni bir sohbet başlatarak asistanla konuşmaya başlayın.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
