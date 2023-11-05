import mongoose from "mongoose";

const QuizSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Quiz name is required']
    },
    creatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    status: {
        type: String,
        default: 'running'
    },
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    player1_question_Number: {
        type: Number,
        default: 0
    },
    player2_question_Number: {
        type: Number,
        default: 0
    },
    player1_Score: {
        type: Number,
        default: 0
    },
    player2_Score: {
        type: Number,
        default: 0
    },
    player1_Time_Taken: {
        type: Number,
        default: -1
    },
    player2_Time_Taken: {
        type: Number,
        default: -1
    },
    player1_finished: {
        type: Boolean,
        default: false
    },
    player2_finished: {
        type: Boolean,
        default: false
    },
});

const QuizModel = mongoose.model('Quiz', QuizSchema);

export default QuizModel;