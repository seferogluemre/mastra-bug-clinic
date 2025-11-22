import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "./components/login-form"

export function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
                    <CardDescription className="text-center">
                        Klinik yönetim sistemine erişmek için giriş yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Hesabınız yok mu?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Kayıt Ol
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
