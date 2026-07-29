import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    relationship: String,
  },
  { _id: false },
);

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    dateOfBirth: Date,
    address: String,
    company: String,
    plan: String,
    goals: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead'],
      default: 'active',
    },
    notes: String,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emergencyContact: emergencyContactSchema,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

clientSchema.pre('save', function normalizeName(next) {
  if (this.isModified('name') && this.name) {
    const [firstName, ...rest] = this.name.split(' ')
    this.firstName = firstName
    this.lastName = rest.join(' ')
  }

  if (this.isModified('firstName') || this.isModified('lastName') || !this.name) {
    const computedName = [this.firstName, this.lastName].filter(Boolean).join(' ').trim()
    if (computedName) {
      this.name = computedName
    }
  }

  return next()
})

clientSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
