
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CertificateTemplate } from "@/components/certificate/CertificateTemplate";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Download, Share2 } from "lucide-react";
import { User, Course, Organization } from "@shared/schema";

type CertificateWithDetails = {
    id: number;
    code: string;
    issuedAt: string;
    user: User & { organization?: Organization };
    course: Course & { organization?: Organization };
};

export default function CertificateView() {
    const { code } = useParams();

    const { data: cert, isLoading, error } = useQuery<CertificateWithDetails>({
        queryKey: [`/api/certificates/${code}`],
        enabled: !!code
    });

    if (isLoading) {
        return (
            <div className="flex bg-background h-screen w-full items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !cert) {
        return (
            <div className="flex flex-col bg-background h-screen w-full items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
                <p className="text-muted-foreground">The certificate code you entered is invalid or does not exist.</p>
                <Button className="mt-4" onClick={() => window.location.href = "/"}>Go Home</Button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col">
            {/* Header for Actions */}
            <div className="bg-white border-b py-4 px-8 flex justify-between items-center shadow-sm print:hidden">
                <div className="flex items-center gap-2">
                    <img src="/assets/logo.svg" alt="Tadreeb" className="h-8" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <span className="font-bold text-xl tracking-tight">TadreebLink Verification</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button onClick={handlePrint}>
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto print:p-0 print:overflow-visible">
                <div className="scale-75 md:scale-100 origin-center transition-transform print:scale-100 print:transform-none">
                    <CertificateTemplate
                        studentName={cert.user.name || cert.user.username}
                        courseTitle={cert.course.title}
                        completionDate={cert.issuedAt}
                        code={cert.code}
                        instructorName={cert.user.organization?.name}
                        orgName={cert.course.organization?.name || "Tadreeb Training Center"}
                        orgLogoUrl={cert.course.organization?.certificateLogoUrl || cert.course.organization?.logoUrl}
                        signatureUrl={cert.course.organization?.certificateSignatureUrl}
                        signerName={cert.course.organization?.certificateSignerName}
                        signerTitle="President / Director"
                    />
                </div>
            </div>

            {/* Footer verification info */}
            <div className="bg-white border-t py-6 text-center text-sm text-muted-foreground print:hidden">
                <p>This certificate verifies that <strong>{cert.user.name || cert.user.username}</strong> has successfully completed the coursework.</p>
                <p className="font-mono mt-1">Verification Code: {cert.code}</p>
            </div>
        </div>
    );
}
