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
        const res = await fetch(`${process.env.API_URL}/getrooms`);
        const rooms = await res.json();
        return rooms.rooms;
    }
    catch(error){
        console.log(error);
    }
}

const addUserToRoom = async(rID,uID)=>{
   try{
    const res = await fetch(`${process.env.API_URL}/add-user-to-room`,{
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
        const res = await fetch(`${process.env.API_URL}/add-msg-to-db`, {
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
        const res = await fetch(`${process.env.API_URL}/get-messages`, {
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
        const res = await fetch(`${process.env.API_URL}/remove-user-from-room`, {
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
        const res = await fetch(`${process.env.API_URL}/get-room-details`, {
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
        const res = await fetch(`${process.env.API_URL}/add-user-to-quizroom`,{
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
        const res = await fetch(`${process.env.API_URL}/wrapup-room`, {
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
        const res = await fetch(`${process.env.API_URL}/get-random-questions`);
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
        const res = await fetch(`${process.env.API_URL}/all-users-completed`, {
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
        const res = await fetch(`${process.env.API_URL}/get-results`,{
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
        const res = await fetch(`${process.env.API_URL}/delete-my-room`,{
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

const getMyRooms = async(userID)=>{
    try{
        const res = await fetch(`${process.env.API_URL}/get-my-rooms`,{
            method: 'POST',
            body: JSON.stringify({userID}),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const response = await res.json();
        return response.rooms;
    }
    catch(error){
        console.log(error);
    }
}

const deleteAllMyRooms = async(uID)=>{
    try{
        const res = await fetch(`${process.env.API_URL}/delete-all-my-rooms`, {
            method: 'POST',
            body: JSON.stringify({uID}),
            headers: {
                'Content-Type': 'application/json',
            }
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
        io.to(rID).emit('roomdeleted');
        socket.emit('deletion-ack', response);
    });

    socket.on('userloggedout', async({uID})=>{
        const response = await deleteAllMyRooms(uID);
        if(response.status==='success'){
            const myrooms = await getMyRooms(uID);
            myrooms.forEach(room=>{
                io.to(room.name).emit('roomdeleted');
            })
            socket.emit('userlogout-ack');
            io.emit('updateRooms');
        }
    })

})

app.get('/', (req,res)=>{
    res.send('Server running');
});

app.use('/api/v1',userRoutes);

const PORT = process.env.PORT || 8080;

server.listen(PORT,()=>{
    console.log(`Listening on http://localhost:8080`);
})