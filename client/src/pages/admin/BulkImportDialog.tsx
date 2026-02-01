
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertUser } from "@shared/schema";

export function BulkImportDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<InsertUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
            setError("Please upload a valid CSV file");
            return;
        }

        setFile(selectedFile);
        setError(null);
        parseCSV(selectedFile);
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            try {
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
                if (lines.length < 2) {
                    setError("CSV file is empty or missing data rows");
                    return;
                }

                const headers = lines[0].split(",").map(h => h.trim());
                const requiredHeaders = ["username", "password", "email", "role"];
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(", ")}`);
                    return;
                }

                const data: InsertUser[] = [];
                const validRoles = ["student", "instructor", "ta", "org_admin", "super_admin"];

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(",").map(v => v.trim());
                    if (values.length !== headers.length) continue; // Skip malformed lines

                    const row: any = {};
                    headers.forEach((header, index) => {
                        if (values[index]) row[header] = values[index];
                    });

                    // Basic validation and transformation
                    if (!row.role) row.role = "student";
                    if (!validRoles.includes(row.role)) row.role = "student";

                    // Ensure strict types
                    const user: InsertUser = {
                        username: row.username,
                        password: row.password,
                        email: row.email,
                        role: row.role as any,
                        name: row.name || null,
                        userCode: row.user_code || null,
                        // optional fields
                        headline: row.headline || null,
                        bio: row.bio || null,
                        organizationId: row.organization_id ? parseInt(row.organization_id) : null,
                        xp: 0,
                        lc: row.lc || row.group || null // Support both 'lc' and 'group' headers
                    };
                    data.push(user);
                }

                setParsedData(data);
                if (data.length === 0) {
                    setError("No valid user data found in file.");
                }
            } catch (err) {
                setError("Failed to parse CSV file");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (parsedData.length === 0) return;

        setLoading(true);
        try {
            await apiRequest("POST", "/api/admin/users/bulk", parsedData);

            toast({
                title: "Import Successful",
                description: `Successfully imported ${parsedData.length} users.`,
            });

            queryClient.invalidateQueries({ queryKey: ["/api/users"] }); // Assuming there is a users list query
            // Also invalidate admin stats
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });

            setOpen(false);
            setFile(null);
            setParsedData([]);
        } catch (err) {
            toast({
                title: "Import Failed",
                description: "There was an error importing users. Please check the file and try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import Users
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bulk Import Users</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <FileUp className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                {file ? file.name : "Click to select CSV file"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Format: username, email, password, role, name, user_code, lc
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {parsedData.length > 0 && !error && (
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">Ready to import {parsedData.length} users</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Preview: {parsedData.slice(0, 3).map(u => u.username).join(", ")}...
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={loading || parsedData.length === 0 || !!error}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Users
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
