import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function RequestDemoDialog() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: "Request Sent Successfully!",
            description: "Our team will contact you within 24 hours.",
        });

        setIsLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-white border border-border text-foreground font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                    Request Demo
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request a Demo</DialogTitle>
                    <DialogDescription>
                        Fill in your details and our sales team will reach out to schedule a personalized walkthrough.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" required placeholder="John Doe" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" type="email" required placeholder="john@company.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" required placeholder="+20 123 456 7890" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">I am a...</Label>
                        <Select onValueChange={setUserType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="instructor">Instructor / Trainer</SelectItem>
                                <SelectItem value="company">Training Company / Center</SelectItem>
                                <SelectItem value="ngo">NGO / Student Activity</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(userType === "company" || userType === "ngo") && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="companyName">
                                {userType === "company" ? "Company Name" : "Organization Name"}
                            </Label>
                            <Input
                                id="companyName"
                                required
                                placeholder={userType === "company" ? "Acme Training Corp" : "IFMSA-Egypt"}
                            />
                        </div>
                    )}

                    <Button type="submit" disabled={isLoading} className="mt-4">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Submit Request"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
