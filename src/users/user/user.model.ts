import mongoose from 'mongoose';

export interface UserDoc extends mongoose.Document {
  firstName?: string,
  lastName?: string,
  email: string;
  role: string
}

export interface UserModel extends mongoose.Model<UserDoc> { }

const schema = new mongoose.Schema<UserDoc, UserModel>({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
  },
},
  {timestamps: true}
);

export const User = mongoose.model<UserDoc, UserModel>('User', schema);