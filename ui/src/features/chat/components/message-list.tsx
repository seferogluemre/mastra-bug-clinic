import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message } from "../types"

interface MessageListProps {
    messages: Message[]
    isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    // Helper to process message content
    const getMessageContent = (content: string | any) => {
        if (typeof content === 'string') {
            // Strip tool calls first
            let processedContent = content.replace(/to=[\w\.]+\s+json\{.*?\}commentary/g, "").trim();

            try {
                // First try to parse the entire content as JSON
                if (processedContent.startsWith('[')) {
                    const parsed = JSON.parse(processedContent);
                    if (Array.isArray(parsed)) {
                        // Filter out reasoning and join text parts
                        const textContent = parsed
                            .filter((item: any) => item.type !== 'reasoning')
                            .map((item: any) => item.text || item.content || '')
                            .join('');
                        return textContent;
                    }
                }
            } catch (e) {
                // Failed to parse as complete JSON
            }

            // Fallback for mixed content
            if (processedContent.startsWith('[')) {
                try {
                    const match = processedContent.match(/^(\[\{[\s\S]*?\}\])\s*([\s\S]*)/);
                    if (match) {
                        JSON.parse(match[1]);
                        processedContent = match[2] || "";
                    }
                } catch (e) { }
            }
            return processedContent;
        }

        if ((content as any)?.toolName) {
            return `Tool used: ${(content as any).toolName}`;
        }

        return JSON.stringify(content);
    }

    // Filter out tool calls/results from display
    const displayMessages = messages.filter(m => {
        if (typeof m.content === 'string') {
            if (m.content.trim().startsWith('[{"type":"tool-call"') ||
                m.content.trim().startsWith('[{"type":"tool-result"')) {
                return false;
            }
        }
        if (Array.isArray(m.content) && m.content.some((c: any) => c.type === 'tool-call' || c.type === 'tool-result')) {
            return false;
        }
        if (typeof m.content === 'object' && (m.content as any)?.toolName) {
            return false;
        }
        return true;
    });

    return (
        <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-6 max-w-3xl mx-auto">
                {displayMessages.map((m, index, filteredMessages) => {
                    const showDateSeparator = index === 0 ||
                        new Date(filteredMessages[index - 1].createdAt || Date.now()).toDateString() !== new Date(m.createdAt || Date.now()).toDateString();

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
                                        {typeof m.content === 'string' ? getMessageContent(m.content) : (
                                            <span className="italic text-gray-500">
                                                {getMessageContent(m.content)}
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
    )
}
