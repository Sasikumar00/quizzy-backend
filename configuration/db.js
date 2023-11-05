import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const db_url = (process.env.DB_URL).replace('<user>', process.env.DB_USER).replace('<password>', process.env.DB_PASSWORD);

const connectDB = async()=>{
    try{
        const db = await mongoose.connect(db_url);
        console.log(`Connected to MongoDB database ${db.connection.host}`)
    }catch(error){
        console.log(`Error in mongoDB ${error}`)
    }
};

export default connectDB;