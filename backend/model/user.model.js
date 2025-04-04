import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    sub: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    friends: {
        type: [{
            friend: { type: Schema.Types.ObjectId, ref: 'User' },
            accepted: { type: Boolean, default: false },
            username : { type: String, required: true }
        }],
        default: []
    },
});

const User = mongoose.model('User', userSchema);
export default User;