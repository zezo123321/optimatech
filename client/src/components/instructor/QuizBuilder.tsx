import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface QuizBuilderProps {
    lessonId: number;
    isOpen: boolean;
    onClose: () => void;
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option
}

export default function QuizBuilder({ lessonId, isOpen, onClose }: QuizBuilderProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeQuestion, setActiveQuestion] = useState<number>(0);

    // Fetch existing questions
    const { data: existingQuestions, isLoading } = useQuery<Question[]>({
        queryKey: [`/api/lessons/${lessonId}/quiz`],
        enabled: isOpen && !!lessonId,
    });

    useEffect(() => {
        if (existingQuestions && existingQuestions.length > 0) {
            // Ensure options are arrays (if stored as json)
            // schema says options: json ("text[]")
            setQuestions(existingQuestions);
        } else {
            // Default to one empty question
            setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
        }
    }, [existingQuestions, isOpen]);

    // Mutation to save questions
    const saveMutation = useMutation({
        mutationFn: async (data: Question[]) => {
            const res = await fetch(`/api/lessons/${lessonId}/quiz/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save quiz");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}/quiz`] });
            toast({
                title: "Success",
                description: "Quiz saved successfully",
            });
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to save quiz: " + error.message,
                variant: "destructive",
            });
        },
    });

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { question: "", options: ["", "", "", ""], correctAnswer: 0 },
        ]);
        setActiveQuestion(questions.length);
    };

    const handleRemoveQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions.length ? newQuestions : [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
        setActiveQuestion(Math.max(0, index - 1));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const currentQ = questions[activeQuestion] || { question: "", options: [], correctAnswer: 0 };

    if (isLoading) return null; // Or loader

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle>Quiz Editor</DialogTitle>
                    <DialogDescription>
                        Add questions and configure answers for this quiz lesson.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Question List */}
                    <div className="w-64 border-r bg-muted/20 overflow-y-auto p-4 flex flex-col gap-2">
                        <Label className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            Questions
                        </Label>
                        {questions.map((q, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveQuestion(idx)}
                                className={`p-3 rounded-lg text-sm cursor-pointer border transition-colors flex justify-between items-center group ${activeQuestion === idx
                                        ? "bg-primary/10 border-primary text-primary font-medium"
                                        : "bg-card hover:bg-muted border-transparent hover:border-border"
                                    }`}
                            >
                                <div className="truncate flex-1 mr-2">
                                    <span className="mr-2 opacity-50">#{idx + 1}</span>
                                    {q.question || "Untitled Question"}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveQuestion(idx);
                                    }}
                                >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full mt-2 border-dashed"
                            onClick={handleAddQuestion}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    {/* Main Content - Active Question Editor */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="space-y-2">
                                <Label>Question Text</Label>
                                <Textarea
                                    placeholder="e.g. What is the capital of France?"
                                    value={currentQ.question}
                                    onChange={(e) =>
                                        updateQuestion(activeQuestion, "question", e.target.value)
                                    }
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Options</Label>
                                <div className="grid gap-3">
                                    {currentQ.options.map((option, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-3">
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-full border cursor-pointer hover:bg-muted transition-colors ${currentQ.correctAnswer === oIdx
                                                        ? "bg-green-100 border-green-500 text-green-700"
                                                        : "bg-muted border-transparent text-muted-foreground"
                                                    }`}
                                                onClick={() => updateQuestion(activeQuestion, "correctAnswer", oIdx)}
                                                title="Mark as correct answer"
                                            >
                                                {currentQ.correctAnswer === oIdx ? <CheckCircle className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-20" />}
                                            </div>
                                            <Input
                                                value={option}
                                                onChange={(e) => updateOption(activeQuestion, oIdx, e.target.value)}
                                                placeholder={`Option ${oIdx + 1}`}
                                                className={currentQ.correctAnswer === oIdx ? "border-green-500 ring-1 ring-green-500/20" : ""}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Click the circle next to an option to mark it as the correct answer.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t bg-muted/10">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => saveMutation.mutate(questions)}
                        disabled={saveMutation.isPending}
                        className="bg-gradient-to-r from-primary to-primary/80"
                    >
                        {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Quiz
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
