import mongoose, {Schema} from 'mongoose';
import {AuthenticationService} from '@exlabs-recruitment-task-sm-common/coomon/build';

export interface AuthUserDoc extends mongoose.Document {
  email: string,
  password: string
};

export interface AuthUserModel extends mongoose.Model<AuthUserDoc> { };

const authUserSchema: Schema<AuthUserDoc, AuthUserModel> = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

authUserSchema.pre('save', async function (done) {
  const authenticationService = new AuthenticationService();
  if (this.isModified('password') || this.isNew) {
    const hashedPwd = await authenticationService.passwordToHash(this.get('password'));
    this.set('password', hashedPwd);
  };
  done();
});

export const AuthUser = mongoose.model<AuthUserDoc, AuthUserModel>('AuthUser', authUserSchema);