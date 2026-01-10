import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
    questionId: string;
    answer: string;
}

export interface IQuizSubmission extends Document {
    quizId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    answers: IAnswer[];
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    correctAnswers: number;
    incorrectAnswers: number;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AnswerSchema: Schema = new Schema({
    questionId: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
});

const QuizSubmissionSchema: Schema = new Schema(
    {
        quizId: {
            type: Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        answers: [AnswerSchema],
        score: {
            type: Number,
            default: 0,
        },
        totalPoints: {
            type: Number,
            default: 0,
        },
        percentage: {
            type: Number,
            default: 0,
        },
        passed: {
            type: Boolean,
            default: false,
        },
        correctAnswers: {
            type: Number,
            default: 0,
        },
        incorrectAnswers: {
            type: Number,
            default: 0,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
QuizSubmissionSchema.index({ quizId: 1, studentId: 1 });

export default mongoose.model<IQuizSubmission>('QuizSubmission', QuizSubmissionSchema);
