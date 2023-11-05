import mongoose from "mongoose";

const QuestionSchema = mongoose.Schema({
    question: {
        type: String
    },
    options: [{
        type: String,
    }],
    answer: {
        type: Number
    }
});

const QuestionModel = mongoose.model('Questions', QuestionSchema);

export default QuestionModel;