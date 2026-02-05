
import { db } from "../server/db";
import { evaluations, evaluationQuestions, evaluationTypeEnum, questionTypeEnum } from "../shared/schema";

async function seedEvaluations() {
    const courseId = 11; // Course A 1

    console.log("Seeding evaluations for Course", courseId);

    // 1. Create Pre-Evaluation
    const [preEval] = await db.insert(evaluations).values({
        courseId,
        type: "pre",
        title: "Pre-Course Assessment",
        description: "Please help us understand your current knowledge level."
    }).returning();

    await db.insert(evaluationQuestions).values([
        {
            evaluationId: preEval.id,
            questionText: "How would you rate your current knowledge of this topic?",
            questionType: "rating",
            order: 1
        },
        {
            evaluationId: preEval.id,
            questionText: "What are your learning goals?",
            questionType: "text",
            order: 2
        }
    ]);

    console.log("Created Pre-Eval:", preEval.id);

    // 2. Create Post-Evaluation
    const [postEval] = await db.insert(evaluations).values({
        courseId,
        type: "post",
        title: "Course Feedback Survey",
        description: "Congratulations! Please rate your experience."
    }).returning();

    await db.insert(evaluationQuestions).values([
        {
            evaluationId: postEval.id,
            questionText: "How satisfied are you with this course?",
            questionType: "rating",
            order: 1
        },
        {
            evaluationId: postEval.id,
            questionText: "Would you recommend this course to a friend?",
            questionType: "mcq",
            options: ["Yes", "No", "Maybe"],
            order: 2
        }
    ]);

    console.log("Created Post-Eval:", postEval.id);
    process.exit(0);
}

seedEvaluations().catch(console.error);
