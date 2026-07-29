import mongoose from 'mongoose';

const monthlyReportSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    totals: {
      clients: {
        active: { type: Number, default: 0 },
        new: { type: Number, default: 0 },
      },
      subscriptions: {
        active: { type: Number, default: 0 },
        renewed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
      },
      sessions: {
        total: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
      },
      payments: {
        collected: { type: Number, default: 0 },
        transactions: { type: Number, default: 0 },
      },
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

const MonthlyReport = mongoose.model('MonthlyReport', monthlyReportSchema);

export default MonthlyReport;
