import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Volume2 } from "lucide-react"

interface TTSDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function TTSDialog({ open, onOpenChange, onConfirm }: TTSDialogProps) {
    function handleConfirm() {
        onConfirm()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-blue-600" />
                        Sesli Dinle
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu mesajı sesli olarak dinlemek istediğinize emin misiniz?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Volume2 className="mr-2 h-4 w-4" />
                        Dinle
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
