import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'quiz_completed' | 'course_enrolled' | 'badge_earned';
    title: string;
    details?: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ActivitySchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['quiz_completed', 'course_enrolled', 'badge_earned'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        details: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IActivity>('Activity', ActivitySchema);
