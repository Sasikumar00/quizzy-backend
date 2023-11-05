import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username is required']
    },
    isJoinedRoom: {
        type: Boolean,
        default: false
    },
    joinedRoomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    }
});

const userModel = mongoose.model('User', userSchema);

export default userModel;