import mongoose from "mongoose";

const RoomSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Room name is required']
    },
    creatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    status: {
        type: String,
        default: 'waiting'
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages:[{
        type: String
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;