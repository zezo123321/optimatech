import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EvaluationFormProps {
    courseId: number;
    type: "pre" | "post";
    onCompleted: () => void;
}

interface Question {
    id: number;
    questionText: string;
    questionType: "rating" | "text" | "mcq";
    options: string[] | null;
    order: number;
}

interface Evaluation {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

export function EvaluationForm({ courseId, type, onCompleted }: EvaluationFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [answers, setAnswers] = useState<Record<number, any>>({});

    const { data: evaluation, isLoading } = useQuery<Evaluation | null>({
        queryKey: [`/api/courses/${courseId}/evaluations/${type}`],
    });

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", `/api/evaluations/${evaluation?.id}/submit`, data);
        },
        onSuccess: () => {
            toast({
                title: "Evaluation Submitted",
                description: "Thank you for your feedback!",
            });
            queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/evaluations/${type}/status`] });
            onCompleted();
        },
        onError: () => {
            toast({
                title: "Submission Failed",
                description: "Please try again.",
                variant: "destructive",
            });
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!evaluation) {
        // If no evaluation exists, we treat it as "completed" (bypass)
        // Ideally the parent should verify this, but safe fallback.
        onCompleted();
        return null;
    }

    const handleSubmit = () => {
        // Validation: Check if all questions are answered?
        // For MVP, we'll implement strict requirement
        const unanswered = evaluation.questions.some(q => !answers[q.id] || answers[q.id] === "");
        if (unanswered) {
            toast({
                title: "Incomplete",
                description: "Please answer all questions before submitting.",
                variant: "destructive"
            });
            return;
        }

        submitMutation.mutate({ answers });
    };

    return (
        <Card className="max-w-3xl mx-auto my-8 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-2xl text-primary">{evaluation.title}</CardTitle>
                <CardDescription className="text-base mt-2">{evaluation.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {evaluation.questions.map((q, index) => (
                    <div key={q.id} className="space-y-4">
                        <Label className="text-lg font-medium">
                            {index + 1}. {q.questionText}
                        </Label>

                        {q.questionType === "text" && (
                            <Textarea
                                placeholder="Your answer..."
                                value={answers[q.id] || ""}
                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                className="min-h-[100px]"
                            />
                        )}

                        {q.questionType === "rating" && (
                            <RadioGroup
                                value={answers[q.id]}
                                onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                                className="flex gap-4"
                            >
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <div key={rating} className="flex flex-col items-center space-y-2 cursor-pointer">
                                        <RadioGroupItem value={rating.toString()} id={`q${q.id}-r${rating}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`q${q.id}-r${rating}`}
                                            className="flex flex-col items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
                                        >
                                            <span className="text-xl font-bold">{rating}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {q.questionType === "mcq" && q.options && (
                            <RadioGroup
                                value={answers[q.id]}
                                onValueChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                                className="space-y-2"
                            >
                                {q.options.map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt} id={`q${q.id}-opt${i}`} />
                                        <Label htmlFor={`q${q.id}-opt${i}`}>{opt}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </div>
                ))}

                <div className="pt-6 flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="w-full md:w-auto"
                    >
                        {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Evaluation
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
