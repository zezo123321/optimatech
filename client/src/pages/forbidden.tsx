import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md mx-4 border-red-200">
                <CardContent className="pt-6 text-center">
                    <div className="flex mb-4 justify-center">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to access this page. If you believe this is an error, please contact support.
                    </p>
                    <div className="space-y-2">
                        <Link href="/">
                            <Button className="w-full" variant="default">Return Home</Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button className="w-full" variant="outline">Login as different user</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
