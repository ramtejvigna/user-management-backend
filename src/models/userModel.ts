import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs"

interface User extends Document {
    username: string;
    email: string;
    password: string;
    userType: 'Admin' | 'User';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Admin', 'User'], required: true },
    email: { type: String, required: true, unique: true },
})

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.pre<User>('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export default mongoose.model<User>('User', UserSchema)