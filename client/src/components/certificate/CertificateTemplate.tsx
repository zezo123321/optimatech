
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Award } from "lucide-react";

interface CertificateTemplateProps {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    code: string;
    instructorName?: string;
    orgName?: string;
    orgLogoUrl?: string | null;
    signatureUrl?: string | null;
    signerName?: string | null;
    signerTitle?: string | null;
    templateUrl?: string | null;
}

export function CertificateTemplate({
    studentName,
    courseTitle,
    completionDate,
    code,
    instructorName,
    orgName,
    orgLogoUrl,
    signatureUrl,
    signerName,
    signerTitle,
    templateUrl
}: CertificateTemplateProps) {
    return (
        <div className="w-full max-w-[800px] aspect-[1.414/1] bg-white text-slate-900 relative overflow-hidden mx-auto shadow-2xl transition-transform duration-500 hover:scale-[1.01] print:hover:scale-100 print:shadow-none print:w-[297mm] print:h-[210mm] print:max-w-none print:fixed print:inset-0 print:m-0 print:rounded-none">

            {/* 1. Custom Template Background (If Available) */}
            {templateUrl ? (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 print:print-color-adjust-exact"
                    style={{ backgroundImage: `url(${templateUrl})` }}
                />
            ) : (
                <>
                    {/* 2. Default Marble & Gold Design */}

                    {/* Marble Texture Background */}
                    <div className="absolute inset-0 z-0 bg-[#fdfbf7] print:print-color-adjust-exact">
                        {/* CSS-based Marble approximation using filters and noise */}
                        <div className="absolute inset-0 opacity-40 mix-blend-multiply filter contrast-150 brightness-110"
                            style={{
                                backgroundImage: `url("https://www.transparenttextures.com/patterns/white-marble.png")`,
                                backgroundSize: '400px'
                            }}
                        ></div>
                        {/* Gold Veins (Simulated with gradients) */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent"></div>
                    </div>

                    {/* Gold Foil Border Frame */}
                    <div className="absolute inset-6 z-10 pointer-events-none">
                        {/* Outer Double Line */}
                        <div className="absolute inset-0 border-[3px] border-amber-400 opacity-80 shadow-[0_0_15px_rgba(251,191,36,0.2)]"></div>
                        <div className="absolute inset-1 border border-amber-300 opacity-60"></div>

                        {/* Inner Fancy Frame */}
                        <div className="absolute inset-4 border-[2px] border-amber-500"></div>

                        {/* Corner Flourishes (Gold CSS Triangles/Shapes) */}
                        {/* Top Left */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-amber-500"></div>
                        <div className="absolute top-2 left-2 w-16 h-16 border-t border-l border-amber-300 transform rotate-3 origin-top-left opacity-50"></div>

                        {/* Top Right */}
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-amber-500"></div>

                        {/* Bottom Left */}
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-amber-500"></div>

                        {/* Bottom Right */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-amber-500"></div>
                    </div>
                </>
            )}

            {/* Content Content - Centered */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-between py-16 px-20">

                {/* Header (Logo & Title) */}
                <div className="text-center space-y-4 pt-4">
                    {/* Badge / Logo */}
                    <div className="mb-6 flex justify-center">
                        {orgLogoUrl ? (
                            <img src={orgLogoUrl} alt="Logo" className="h-20 object-contain drop-shadow-md" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white shadow-lg">
                                <Award className="w-8 h-8" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-serif font-bold text-slate-800 tracking-wider uppercase drop-shadow-sm">
                            Certificate
                        </h1>
                        <p className="text-xl font-serif text-amber-600 tracking-[0.4em] uppercase font-semibold">
                            Of Completion
                        </p>
                    </div>
                </div>

                {/* Student Name */}
                <div className="flex-1 flex flex-col items-center justify-center w-full space-y-2">
                    <p className="font-serif italic text-slate-500 text-lg">This allows us to certify that</p>

                    <h2 className="text-6xl md:text-8xl font-['Great_Vibes'] text-slate-900 py-6 drop-shadow-sm min-h-[120px] pb-4">
                        {studentName}
                    </h2>

                    {/* Divider */}
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    <p className="font-serif italic text-slate-500 text-lg pt-4">has successfully completed the course</p>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 max-w-2xl text-center leading-tight">
                        {courseTitle}
                    </h3>
                </div>

                {/* Footer (Signatures & Date) */}
                <div className="w-full grid grid-cols-2 gap-24 items-end pb-4">
                    {/* Instructor / Signer */}
                    <div className="text-center">
                        <div className="h-16 flex items-end justify-center mb-2">
                            {signatureUrl ? (
                                <img src={signatureUrl} alt="Signature" className="max-h-16 object-contain" />
                            ) : (
                                <span className="font-['Great_Vibes'] text-3xl text-slate-600 transform -rotate-2">{signerName || instructorName}</span>
                            )}
                        </div>
                        <div className="h-px w-full bg-slate-300"></div>
                        <p className="mt-2 font-bold text-slate-800 font-serif">{signerName || instructorName || "Instructor"}</p>
                        <p className="text-xs uppercase tracking-widest text-slate-500">{signerTitle || "Instructor"}</p>
                    </div>

                    {/* Verification Code Block (Using Date slot usually but adding code here) */}
                    <div className="text-center">
                        <div className="h-16 flex items-end justify-center mb-2">
                            <span className="font-serif text-xl text-slate-700">{format(new Date(completionDate), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="h-px w-full bg-slate-300"></div>
                        <p className="mt-2 font-bold text-slate-800 font-serif">Date Issued</p>
                        <div className="mt-1 bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                            <p className="text-[10px] font-mono font-medium text-amber-800">
                                Code: {code}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
