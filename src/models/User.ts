import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { CallbackError } from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  roles: ('admin' | 'instructor' | 'student')[];
  currentRole: 'admin' | 'instructor' | 'student';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password should be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    roles: {
      type: [String],
      enum: ['admin', 'instructor', 'student'],
      default: ['student'],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one role must be assigned',
      },
    },
    currentRole: {
      type: String,
      enum: ['admin', 'instructor', 'student'],
      default: 'student',
      validate: {
        validator: function (this: IUser, role: string) {
          return this.roles.includes(
            role as 'admin' | 'instructor' | 'student'
          );
        },
        message: 'Current role must be one of the assigned roles',
      },
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err: Error | unknown) {
    return next(err as CallbackError);
  }
});

// Ensure roles array is never empty and currentRole is valid
userSchema.pre('save', function (next) {
  if (!this.roles || this.roles.length === 0) {
    this.roles = ['student'];
  }
  if (!this.currentRole || !this.roles.includes(this.currentRole)) {
    this.currentRole = this.roles[0];
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', userSchema);
