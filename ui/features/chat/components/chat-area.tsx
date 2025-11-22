import { Button } from "@/components/ui/button"
import { MessageSquare, MoreVertical } from "lucide-react"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { Thread, Message } from "../types"

interface ChatAreaProps {
    activeThread: Thread | undefined
    messages: Message[]
    isLoading: boolean
    onSendMessage: (message: string) => void
}

export function ChatArea({ activeThread, messages, isLoading, onSendMessage }: ChatAreaProps) {
    if (!activeThread) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-400 bg-white dark:bg-gray-900">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Hoş Geldiniz!</h3>
                <p className="text-sm max-w-xs text-center">Sol menüden mevcut bir sohbeti seçin veya yeni bir sohbet başlatarak asistanla konuşmaya başlayın.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
                <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl mr-3 shadow-sm">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white leading-tight">
                            {activeThread.title || "Sohbet"}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                            {activeThread.createdAt ? new Date(activeThread.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>

            <MessageList messages={messages} isLoading={isLoading} />
            <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
    )
}
