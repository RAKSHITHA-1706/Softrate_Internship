import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    instructor: string;
    description?: string;
    thumbnail?: string;
    totalQuizzes: number;
    completedQuizzes: number;
    students: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        instructor: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        thumbnail: {
            type: String,
        },
        totalQuizzes: {
            type: Number,
            default: 0,
        },
        completedQuizzes: {
            type: Number,
            default: 0,
        },
        students: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICourse>('Course', CourseSchema);
