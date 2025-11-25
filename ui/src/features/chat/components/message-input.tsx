import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface MessageInputProps {
    onSendMessage: (message: string) => void
    isLoading: boolean
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
    const [input, setInput] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        onSendMessage(input)
        setInput("")
    }

    return (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-center">
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
    )
}
