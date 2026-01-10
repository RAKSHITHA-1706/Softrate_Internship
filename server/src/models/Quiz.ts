import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
    _id?: mongoose.Types.ObjectId;
    text: string;
    type: 'mcq' | 'aptitude';
    options?: string[];
    correctAnswer?: string;
    points: number;
}

export interface IQuiz extends Document {
    title: string;
    courseId: mongoose.Types.ObjectId;
    description: string;
    questions: IQuestion[];
    durationMinutes: number;
    customId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema: Schema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['mcq', 'aptitude'],
            required: true,
        },
        options: {
            type: [String],
        },
        correctAnswer: {
            type: String,
        },
        points: {
            type: Number,
            default: 1,
        },
    },
    { _id: true }
);

const QuizSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        description: {
            type: String,
        },
        questions: [QuestionSchema],
        durationMinutes: {
            type: Number,
            required: true,
            default: 30,
        },
        customId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple null values but ensures uniqueness when present
        },
    },
    {
        timestamps: true,
    }
);



// Pre-save hook to generate customId if not provided
QuizSchema.pre('save', function (next) {
    if (!this.customId) {
        // Generate a unique customId using timestamp and random string
        this.customId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    next();
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
