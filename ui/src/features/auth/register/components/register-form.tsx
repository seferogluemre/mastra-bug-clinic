"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchClient } from "@/lib/api"

export function RegisterForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email")
        const password = formData.get("password")
        const firstName = formData.get("firstName")
        const lastName = formData.get("lastName")

        try {
            const res = await fetchClient("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, firstName, lastName }),
            })

            if (res.success) {
                router.push("/login?registered=true")
            } else {
                setError(res.error || "Kayıt başarısız")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input id="firstName" name="firstName" placeholder="Adınız" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input id="lastName" name="lastName" placeholder="Soyadınız" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="ornek@email.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>
        </form>
    )
}
