import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
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
import { ThreadList } from "./thread-list"
import { NewThreadDialog } from "./new-thread-dialog"
import { DeleteThreadDialog } from "./delete-thread-dialog"
import { Thread } from "../types"
import { useState } from "react"

interface ChatSidebarProps {
    user: { name: string; email: string } | null
    threads: Thread[]
    activeThreadId: string | null
    onSelectThread: (threadId: string) => void
    onDeleteThread: (threadId: string) => Promise<void>
    onCreateThread: (title: string) => Promise<void>
    onLogout: () => void
}

export function ChatSidebar({
    user,
    threads,
    activeThreadId,
    onSelectThread,
    onDeleteThread,
    onCreateThread,
    onLogout
}: ChatSidebarProps) {
    const [isNewThreadDialogOpen, setIsNewThreadDialogOpen] = useState(false)
    const [isDeleteThreadDialogOpen, setIsDeleteThreadDialogOpen] = useState(false)
    const [threadIdToDelete, setThreadIdToDelete] = useState<string | null>(null)
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

    function handleDeleteClick(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        setThreadIdToDelete(id)
        setIsDeleteThreadDialogOpen(true)
    }

    async function handleConfirmDelete() {
        if (threadIdToDelete) {
            await onDeleteThread(threadIdToDelete)
            setIsDeleteThreadDialogOpen(false)
            setThreadIdToDelete(null)
        }
    }

    return (
        <div className="flex-shrink-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-10">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h1 className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">Mastra AI</h1>
                <NewThreadDialog
                    open={isNewThreadDialogOpen}
                    onOpenChange={setIsNewThreadDialogOpen}
                    onSubmit={onCreateThread}
                />
            </div>

            <ScrollArea className="flex-1 p-4">
                <ThreadList
                    threads={threads}
                    activeThreadId={activeThreadId}
                    onSelectThread={onSelectThread}
                    onDeleteThread={handleDeleteClick}
                />
                <DeleteThreadDialog
                    open={isDeleteThreadDialogOpen}
                    onOpenChange={setIsDeleteThreadDialogOpen}
                    onConfirm={handleConfirmDelete}
                />
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
                            <AlertDialogAction onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white">
                                Çıkış Yap
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
