import mongoose from 'mongoose';

const historyEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['created', 'updated', 'renewed', 'cancelled'],
      required: true,
    },
    previousEndDate: Date,
    newEndDate: Date,
    notes: String,
    actedAt: {
      type: Date,
      default: Date.now,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false },
);

const subscriptionSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    clientName: {
      type: String,
      trim: true,
      default: '',
    },
    plan: {
      type: String,
      trim: true,
      default: '',
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    planType: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'custom'],
      default: 'monthly',
    },
    billingCycle: {
      type: String,
      trim: true,
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    sessionsIncluded: {
      type: Number,
      default: 0,
      min: 0,
    },
    sessionsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    history: [historyEntrySchema],
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

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
