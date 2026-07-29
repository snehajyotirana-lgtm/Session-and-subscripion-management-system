import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    trainerName: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['personal', 'group', 'assessment', 'follow_up', 'custom'],
      default: 'personal',
    },
    scheduledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
    },
    attendance: {
      type: Number,
      default: 0,
      min: 0,
    },
    seats: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    location: String,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
