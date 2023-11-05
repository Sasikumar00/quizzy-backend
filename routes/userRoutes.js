import { Router } from "express";
import userModel from '../models/UserModel.js';
import RoomModel from '../models/RoomModel.js';
import QuizModel from "../models/QuizModel.js";
import QuestionModel from "../models/QuestionModel.js";

const router = Router();

router.post('/add-questions', async(req,res)=>{
    const questions = req.body;
    try{
        questions.forEach(async(q)=>{
            await QuestionModel.create({question: q.question, options: q.options, answer: q.answer});
        })
        res.send({status: 'success', message: 'Added questions to the database'})
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.get('/get-all-questions', async(req,res)=>{
    try{
    const questions = await QuestionModel.find();
    if(questions){
        res.send({status: 'success', questions: questions})
    }
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.get('/get-random-questions', async(req,res)=>{
    try{
        const pipeline = [
            { $sample: { size: 5 } },
            {
              $project: {
                question: 1,
                options: 1,
              },
            },
        ];
      const documents = await QuestionModel.aggregate(pipeline);
      res.send({status: 'success', questions: documents})
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.get('/getrooms', async(req,res)=>{
    try{
    const rooms = await RoomModel.find({
        $expr: { $lt: [{ $size: "$members" }, 2] },
        status: { $ne: 'completed' },
      }).sort('-createdAt').populate('creatorID');
    res.send({status: 'success', rooms});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong', rooms: []})
    }
});

router.post('/create-user', async(req,res)=>{
    const {username} = req.body;
    try{
    const existingUser = await userModel.find({username});
    if(existingUser[0]){
        return res.send({status: 'fail', message: 'Choose a different username'});
    }
    const newUser = await userModel.create({username});
    if(newUser)
        res.send({status: 'success', message: 'User created', userData: newUser});
    else{
        throw new Error('No user created');
    }
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'});
    }
});

router.post('/create-room', async(req,res)=>{
    const roomDetails = req.body;
    const existingRoom = await RoomModel.findOne({name: roomDetails.roomName, status: {$ne: 'completed'}});
    if(existingRoom){
        return res.send({status: 'fail', message: 'Room Name Already Exists'})
    }
    await RoomModel.create({name: roomDetails.roomName, creatorID: roomDetails.creatorID});
    const newRoom = await RoomModel.findOne({name: roomDetails.roomName});
    const newQuizRoom = await QuizModel.create({name: `quiz-${newRoom.name}`,creatorID: roomDetails.creatorID, roomID: newRoom._id});
    res.send({status: 'success', message: 'New Room Created'});
});

router.post('/delete-user', async(req,res)=>{
    const {username} = req.body;
    try{
    const existingUser = await userModel.findOne({username});
    if(!existingUser){
        return res.send({status: 'fail', message: 'No user found'});
    }
    await userModel.deleteOne({username});
    res.send({status: 'success', message: 'Logging out'});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'});
    }

})

router.post('/add-user-to-room', async(req,res)=>{
    try{
        const {rID, uID} = req.body;
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}});
        const existingUser = await userModel.findOne({_id: uID});
        const existingQuizRoom = await QuizModel.findOne({name: `quiz-${rID}`});
        if(!existingRoom){
            return res.send({status: 'fail', message: 'No room found'});
        }
        if(!existingUser){
            return res.send({status: 'fail', message: 'User not found'});
        }
        if(existingRoom.members.length<2){
            if(!existingRoom.members.includes(uID)){
                if(!existingUser.isJoinedRoom){
                    existingRoom.members.push(uID);
                    existingQuizRoom.members.push(uID);
                    await existingRoom.save();
                    await existingQuizRoom.save()
                    existingUser.isJoinedRoom = true;
                    existingUser.joinedRoomID=existingRoom._id;
                    await existingUser.save();
                    return res.send({status: 'success', message: 'Joined room'});
                }
                else{
                    return res.send({status: 'fail', message: 'Cannot join multiple rooms'});
                }
            }
            else{
                return res.send({status: 'ok', message: 'Already joined the room'});
            }
        }
        else{
            if(existingRoom.members.includes(uID))
                return res.send({})
            res.send({status: 'fail', message: 'Room is full'});
        }
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/add-user-to-quizroom', async(req,res)=>{
    const {rID, qID} = req.body;
    try{
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}});
        const existingQuizRoom = await QuizModel.findOne({name: qID, status: {$ne: 'completed'}});
        if(existingQuizRoom.members == existingRoom.members){
            return
        }
        existingQuizRoom.members = [...existingRoom.members];
        await existingQuizRoom.save();
        res.send({status: 'success', message: 'User added to the quiz room'})
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/remove-user-from-room', async(req,res)=>{
    try{
        const {rID, uID} = req.body;
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}});
        const existingUser = await userModel.findOne({_id: uID});
        const existingQuizRoom = await QuizModel.findOne({name: `quiz-${rID}`});
        if(!existingRoom){
            return res.send({status: 'fail', message: 'No room found'});
        }
        if(!existingUser){
            return res.send({status: 'fail', message: 'User not found'});
        }
        if(existingRoom.members.includes(uID)){
            existingRoom.members.remove(uID);
            existingQuizRoom.members.remove(uID);
            await existingRoom.save();
            await existingQuizRoom.save()
            existingUser.isJoinedRoom = false;
            existingUser.joinedRoomID=null;
            await existingUser.save();
           return res.send({status: 'success', message: 'Left room'});
        }
        else{
            return res.send({status: 'fail', message: 'User not found in room'})
        }
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/get-user-details', async(req,res)=>{
    const {username} = req.body;
    try{
        const existingUser = await userModel.findOne({username: username}).populate('joinedRoomID');
        if(!existingUser){
            return res.send({status: 'fail', message: 'No user found'});
        }
        return res.send({status: 'success', data: existingUser});
    }
    catch(error){
        console.log(error);
        return res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/get-my-rooms', async(req,res)=>{
    const {userID} = req.body;
    try{
    const rooms = await RoomModel.find({creatorID: userID, status: {$ne: 'completed'}});
    res.send({status: 'success', rooms})
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/add-msg-to-db',async(req,res)=>{
    const {rID,newMsg} = req.body;
    try{
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}});
        if(!existingRoom){
            return res.send({status: 'fail', message: 'Room not found'});
        }
        existingRoom.messages.push(newMsg);
        await existingRoom.save();
        res.send({status: 'success'});
    }
    catch(error){
        console.log(error);
        return res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/get-messages', async(req,res)=>{
    try{
        const {rID} = req.body;
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}});
        const messages = existingRoom.messages;
        res.send({status: 'success', messages})

    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'});
    }
})

router.post('/get-room-details', async(req,res)=>{
    const {rID} = req.body;
    try{
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}}).populate('creatorID').populate('members').select('-messages');
        if(!existingRoom){
            return res.send({status: 'fail', message: 'Room not found'})
        }
        return res.send({status: 'success', data: existingRoom});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/update-room-status', async(req,res)=>{
    const {rID, uID} = req.body;
    try{
    const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}}).populate('creatorID');
    if(!existingRoom){
        return res.send({status: 'fail', message: 'Room not found'});
    }
    if(!existingRoom.creatorID.username===uID){
        return res.send({status: 'fail', message: 'Unauthorized'});
    }
    existingRoom.status='started';
    await existingRoom.save();
    res.send({status: 'success', message: 'Quiz Starting'});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'});
    }
})

router.post('/update-quiz-room-members', async(req,res)=>{
    const {rID} = req.body;
    try{
        const existingRoom = await RoomModel.findOne({name: rID, status: {$ne: 'completed'}})
        const existingQuizRoom = await QuizModel.findOne({name: `quiz-${rID}`, status: {$ne: 'completed'}});
        existingQuizRoom.members = existingRoom.members;
        await existingQuizRoom.save();
        res.send({status: 'success', message: 'Removed user from quiz room'})
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

const scoreCalculator = async(answers)=>{
    let questionIDs = [];
    let validAnwers = answers.filter(answer=>answer!==-1);
    answers.forEach((a)=>{
        if(a!=-1){
            questionIDs.push(a.questionID)
        }
    });
    const questions = await QuestionModel.find({_id: { $in: questionIDs } });
    const score = validAnwers.reduce((totalScore,answer)=>{
        const matchingQuestion = questions.find(question=>question._id.toString()===answer.questionID);

        if(matchingQuestion && matchingQuestion.answer===answer.answer){
            totalScore+=10;
        }
        return totalScore;
    }, 0)
    return [score, validAnwers.length];
}

router.post('/update-quiz-completion-status', async(req,res)=>{
    const {qID, userID, time_taken, answers} = req.body;
    try{
        const existingQuizRoom = await QuizModel.findOne({name: qID, status: {$ne: 'completed'}});
        if(existingQuizRoom.members.indexOf(userID)===0){
            existingQuizRoom.player1_finished=true;
            existingQuizRoom.player1_Time_Taken=time_taken;
            const finalResults = await scoreCalculator(answers);
            existingQuizRoom.player1_Score=finalResults[0];
            existingQuizRoom.player1_question_Number=finalResults[1];
            await existingQuizRoom.save();
        }
        else{
            existingQuizRoom.player2_finished=true;
            existingQuizRoom.player2_Time_Taken=time_taken;
            const finalResults = await scoreCalculator(answers);
            existingQuizRoom.player2_Score=finalResults[0];
            existingQuizRoom.player2_question_Number=finalResults[1];
            await existingQuizRoom.save()
        }
        res.send({status: 'success', message: 'Updated quiz completion status'});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/all-users-completed', async(req,res)=>{
    const {qID} = req.body;
    try{
        const existingQuizRoom = await QuizModel.findOne({name: qID, status: {$ne: 'completed'}});
        if(existingQuizRoom.player1_finished && existingQuizRoom.player2_finished){
            return res.send(true);
        }
        else{
            res.send(false);
        }
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/get-results', async(req,res)=>{
    const {qID} = req.body;
    try{
        const results = []
        const existingQuizRoom = await QuizModel.findOne({name: qID, status: {$ne: 'completed'}}).populate('members');
        const members = existingQuizRoom.members;
        if(existingQuizRoom.player1_Score===existingQuizRoom.player2_Score){
            if(existingQuizRoom.player1_Time_Taken>existingQuizRoom.player2_Time_Taken){
                results.push({
                    name: members[0].username,
                    score: existingQuizRoom.player1_Score,
                    time_taken: existingQuizRoom.player1_Time_Taken
                });
                results.push({
                    name: members[1].username,
                    score: existingQuizRoom.player2_Score,
                    time_taken: existingQuizRoom.player2_Time_Taken
                });
            }
            else if(existingQuizRoom.player1_Time_Taken<existingQuizRoom.player2_Time_Taken){
                results.push({
                    name: members[1].name,
                    score: existingQuizRoom.player2_Score,
                    time_taken: existingQuizRoom.player2_Time_Taken
                });
                results.push({
                    name: members[0].name,
                    score: existingQuizRoom.player1_Score,
                    time_taken: existingQuizRoom.player1_Time_Taken
                });
            }
            else{
                const draw = {message: `It's a draw`}
                results.push(draw);
            }
        }
        else if(existingQuizRoom.player1_Score>existingQuizRoom.player2_Score){
            results.push({
                name: members[0].username,
                score: existingQuizRoom.player1_Score,
                time_taken: existingQuizRoom.player1_Time_Taken
            });
            results.push({
                name: members[1].username,
                score: existingQuizRoom.player2_Score,
                time_taken: existingQuizRoom.player2_Time_Taken
            });
        }
        else{
            results.push({
                name: members[1].name,
                score: existingQuizRoom.player2_Score,
                time_taken: existingQuizRoom.player2_Time_Taken
            });
            results.push({
                name: members[0].name,
                score: existingQuizRoom.player1_Score,
                time_taken: existingQuizRoom.player1_Time_Taken
            });
        }
        res.send({status: 'success', results});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})

router.post('/wrapup-room', async(req,res)=>{
    try{
    const {qID} = req.body;
    const existingQuizRoom = await QuizModel.findOne({name: qID, status: {$ne: 'completed'}});
    const existingRoom = await RoomModel.findOne({name: qID.split('-')[1], status: {$ne: 'completed'}});
    existingRoom.members.forEach(async(member)=>{
        const existingUser = await userModel.findOne({_id: member});
        existingUser.isJoinedRoom = false;
        existingUser.joinedRoomID = null;
        await existingUser.save();
    })
    existingQuizRoom.status='completed';
    existingRoom.status='completed';
    await existingQuizRoom.save();
    await existingRoom.save();
    res.send({status: 'success', message: 'Status completed successfully'});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }

})

router.post('/delete-my-room', async(req,res)=>{
    const {rID, uID} = req.body;
    try{
        const existingRoom = await RoomModel.findOne({name: rID});
        if(!existingRoom){
            return res.send({status: 'fail', message: 'Room not found'});
        }
        if(existingRoom.creatorID!=uID){
            return res.send({status: 'fail', message: 'Unauthorized'});
        }
        const existingQuizRoom = await QuizModel.findOne({name: `quiz-${rID}`});
        existingRoom.status='completed';
        existingQuizRoom.status='completed';
        await existingRoom.save();
        await existingQuizRoom.save();
        res.send({status: 'success', message: 'Room deleted successfully'});
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
})
export default router;