import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizTakerProps {
    lessonId: number;
    courseId: number;
    onComplete: () => void;
}

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

export default function QuizTaker({ lessonId, courseId, onComplete }: QuizTakerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [quizState, setQuizState] = useState<'intro' | 'active' | 'finished'>('intro');
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);

    // Fetch questions
    const { data: questions, isLoading } = useQuery<Question[]>({
        queryKey: [`/api/lessons/${lessonId}/quiz`],
        enabled: !!lessonId,
    });

    const submitMutation = useMutation({
        mutationFn: async (result: { score: number; passed: boolean }) => {
            const res = await fetch(`/api/lessons/${lessonId}/quiz/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...result, courseId }),
            });
            if (!res.ok) throw new Error("Failed to submit result");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] }); // Refresh progress
            onComplete(); // Trigger parent actions if any
        },
    });

    const handleStart = () => {
        setQuizState('active');
        setCurrentQuestionIndex(0);
        setAnswers({});
    };

    const handleAnswer = (optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    };

    const handleNext = () => {
        if (questions && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        if (!questions) return;

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / questions.length) * 100);
        const isPassed = calculatedScore >= 70; // 70% passing grade

        setScore(calculatedScore);
        setPassed(isPassed);
        setQuizState('finished');

        // Submit result
        submitMutation.mutate({ score: calculatedScore, passed: isPassed });
    };

    const handleRetry = () => {
        setQuizState('intro');
        setAnswers({});
        setCurrentQuestionIndex(0);
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!questions || questions.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No questions available for this quiz.
                </CardContent>
            </Card>
        );
    }

    // INTRO STATE
    if (quizState === 'intro') {
        return (
            <Card className="w-full max-w-2xl mx-auto border-t-4 border-t-primary shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold">Quiz Time!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 py-8">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                        This quiz contains {questions.length} questions.
                        <br />
                        You need 70% to pass and complete this lesson.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <Button size="lg" onClick={handleStart} className="w-full max-w-xs text-lg">
                        Start Quiz
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // FINISHED STATE
    if (quizState === 'finished') {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Quiz Results</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 space-y-6">
                    <div className="flex flex-col items-center">
                        {passed ? (
                            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <h3 className={`text-4xl font-bold ${passed ? "text-green-600" : "text-destructive"}`}>
                                {score}%
                            </h3>
                            <p className="text-xl font-medium">
                                {passed ? "Congratulations! You Passed!" : "Not quite there yet."}
                            </p>
                            <p className="text-muted-foreground">
                                Required score: 70%
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4 pb-8">
                    {!passed && (
                        <Button variant="outline" onClick={handleRetry}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry Quiz
                        </Button>
                    )}
                    {/* If passed, they can proceed via the main player navigation, no explicit button needed here mostly */}
                </CardFooter>
            </Card>
        );
    }

    // ACTIVE STATE
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-sm">
            <div className="p-6 pb-0 space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}% Completed</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <CardContent className="p-8 space-y-8">
                <h3 className="text-xl font-medium leading-relaxed">
                    {currentQuestion.question}
                </h3>

                <RadioGroup
                    value={answers[currentQuestionIndex]?.toString()}
                    onValueChange={(val) => handleAnswer(parseInt(val))}
                    className="space-y-3"
                >
                    {currentQuestion.options.map((option, idx) => (
                        <div key={idx} className={`flex items-center space-x-2 border rounded-lg p-4 transition-colors ${answers[currentQuestionIndex] === idx ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                            <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                            <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer text-base font-normal">
                                {option}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>

            <CardFooter className="flex justify-between p-6 bg-muted/10 border-t">
                <Button
                    variant="ghost"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>

                <Button
                    onClick={handleNext}
                    disabled={answers[currentQuestionIndex] === undefined}
                    className="min-w-[120px]"
                >
                    {currentQuestionIndex === questions.length - 1 ? (
                        <>Finish Quiz</>
                    ) : (
                        <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
