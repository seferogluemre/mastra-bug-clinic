import { Button } from "@/components/ui/button"
import { MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Thread } from "../types"

interface ThreadListProps {
    threads: Thread[]
    activeThreadId: string | null
    onSelectThread: (threadId: string) => void
    onDeleteThread: (e: React.MouseEvent, threadId: string) => void
}

export function ThreadList({ threads, activeThreadId, onSelectThread, onDeleteThread }: ThreadListProps) {
    return (
        <div className="space-y-2">
            {threads.map((thread) => (
                <Button
                    key={thread.threadId}
                    variant={activeThreadId === thread.threadId ? "secondary" : "ghost"}
                    className={cn(
                        "w-full flex justify-start column-gap-3 text-left truncate transition-colors",
                        activeThreadId === thread.threadId ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={() => onSelectThread(thread.threadId)}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span className="truncate font-medium text-start">{thread.title || "Yeni Sohbet"}</span>
                    <span
                        className="text-end"
                        onClick={(e) => onDeleteThread(e, thread.threadId)}
                    >
                        <Trash2 className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 hover:text-red-500" />
                    </span>
                </Button>
            ))}
        </div>
    )
}
