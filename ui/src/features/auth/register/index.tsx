import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "./components/register-form"

export function RegisterPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
                    <CardDescription className="text-center">
                        Yeni bir hesap oluşturun
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Zaten hesabınız var mı?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Giriş Yap
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
