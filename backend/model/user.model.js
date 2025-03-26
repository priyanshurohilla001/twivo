import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    sub : {
        type : String,
        required : true,
        unique : true
    } ,
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    friends : {
        type : [String],
        default : []
    },
});

const User = mongoose.model('User', userSchema);
export default User;