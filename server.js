import express from 'express'
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import http from 'http'
const server = http.createServer(app)
import { Server } from 'socket.io';
const io = new Server(server,{
    cors: {origin: '*'}
})
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import connectDB from './configuration/db.js'
import fetch from 'node-fetch';

app.use(express.json());
app.use(cors());


const getRooms = async()=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/getrooms');
        const rooms = await res.json();
        return rooms.rooms;
    }
    catch(error){
        console.log(error);
    }
}

const addUserToRoom = async(rID,uID)=>{
   try{
    const res = await fetch('http://localhost:8080/api/v1/add-user-to-room',{
        method: 'POST',
        body: JSON.stringify({ rID, uID }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const response = await res.json()
    return response;
   }
   catch(error){
    console.log(error);
   }
}

const addMessageToDatabase = async(rID, newMsg)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/add-msg-to-db', {
            method: 'POST',
            body: JSON.stringify({rID, newMsg}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    catch(error){
        console.log(error);
    }
}

const getMessages = async(rID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/get-messages', {
            method: 'POST',
            body: JSON.stringify({rID}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const response = res.json();
        return response;
    }
    catch(error){
        console.log(error);
    }
}

const removeUserFromRoom = async(rID, uID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/remove-user-from-room', {
            method: 'POST',
            body: JSON.stringify({ rID, uID }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
    }
}

const getRoomDetail = async(rID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/get-room-details', {
            method: 'POST',
            body: JSON.stringify({ rID }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
    }
}

const addUsertoQuizRoom = async(rID, qID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/add-user-to-quizroom',{
            method: 'POST',
            body: JSON.stringify({ rID, qID }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json()
        return response;
    }
    catch(error){
    console.log(error);
    }
}

const updateQuizRoomMembers = async(rID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/update-quiz-room-members',{
            method: 'POST',
            body: JSON.stringify({ rID }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json()
        return response;
    }
    catch(error){
    console.log(error);
    }
}

const wrapUpRoom = async(qID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/wrapup-room', {
            method: 'POST',
            body: JSON.stringify({ qID }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
}

const getQuestions = async()=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/get-random-questions');
        const response = await res.json();
        return response.questions;
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
}

const updateQuizCompletionStatus = async(qID, userID, time_taken,answers)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/update-quiz-completion-status', {
            method: 'POST',
            body: JSON.stringify({ qID, userID, time_taken, answers }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
        res.status({status: 'error', message: 'Something went wrong'})
    }
}

const checkAllCompleted = async(qID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/all-users-completed', {
            method: 'POST',
            body: JSON.stringify({ qID }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
}

const getResults = async(qID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/get-results',{
            method: 'POST',
            body: JSON.stringify({qID}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
        res.send({status: 'error', message: 'Something went wrong'})
    }
}

const deleteMyRoom = async(rID, uID)=>{
    try{
        const res = await fetch('http://localhost:8080/api/v1/delete-my-room',{
            method: 'POST',
            body: JSON.stringify({rID,uID}),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const response = await res.json();
        return response;
    }
    catch(error){
        console.log(error);
    }
}

connectDB();

io.on('connection',(socket)=>{
    // console.log('connection created')
    socket.on('userLoggedIn', async()=>{
        const rooms = await getRooms();
        io.emit('roomlist', {rooms});
    })
    socket.on('joinroom', async({roomID, userID})=>{
        socket.join(roomID);
        const response = await addUserToRoom(roomID, userID);
        socket.emit('joiningUpdate', response);
        io.emit('updateRooms');
        socket.to(roomID).emit('newUserJoined', {message: 'A new user has joined', user: userID});
        console.log(`${userID} joined ${roomID}`);
    });
    socket.on('getMessages', async({rID})=>{
        const res = await getMessages(rID);
        io.to(rID).emit('messages', res.messages);
    })
    socket.on('send message',async({rID,uID,message})=>{
        const newMessage = `${uID}: ${message}`;
        await addMessageToDatabase(rID,newMessage);
        const res = await getMessages(rID);
        io.to(rID).emit('messages', res.messages);
    })
    socket.on('initiate-close',async({roomID,userID})=>{
        const reponse = removeUserFromRoom(roomID,userID);
        socket.leave(roomID);
        io.emit('updateRooms');
        await updateQuizRoomMembers(roomID);
        console.log(`${userID} left ${roomID}`);
    });
    socket.on('newroomcreated',async()=>{
        const rooms = await getRooms();
        io.emit('roomlist', {rooms});
    });
    socket.on('getrooms', async()=>{
        const rooms = await getRooms();
        io.emit('roomlist', {rooms});
    });
    socket.on('getRoomDetails', async({rID})=>{
        const response = await getRoomDetail(rID);
        io.emit('roomData', response);
    });
    socket.on('startQuiz', ({rID})=>{
        io.to(rID).emit('initiateQuiz');
    });
    socket.on('beginQuiz', async({rID,qID})=>{
        socket.join(qID);
        await addUsertoQuizRoom(rID, qID);
        socket.to(qID).emit('startingQuiz');
    });
    socket.on('getQuestions', async({qID})=>{
        const questions = await getQuestions();
        socket.to(qID).emit('questions', {questions: questions});
    })

    socket.on('initiateEndQuiz', async({qID, userID, time_taken,answers})=>{
        const res = await updateQuizCompletionStatus(qID, userID, time_taken,answers);
        if(res.status==='success'){
            const allFinised = await checkAllCompleted(qID);
            if(allFinised){
                const res = await getResults(qID);
                const results = res.results;
                await wrapUpRoom(qID);
                io.to(qID).emit('showResults', results);
                io.emit('updateRooms');
            }
        }
    })
    socket.on('delete-my-room', async({rID, uID})=>{
        const response = await deleteMyRoom(rID, uID);
        io.emit('updateRooms');
        socket.emit('deletion-ack', response);
    })

})

app.get('/', (req,res)=>{
    res.send('Server running');
});

app.use('/api/v1',userRoutes);

server.listen(8080,()=>{
    console.log(`Listening on http://localhost:8080`);
})