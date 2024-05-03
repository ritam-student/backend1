import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connections = await mongoose.connect(`${process.env.MONGODB_URL}/ ${DB_NAME}`);
        console.log(`\n Mongodb is connected .. DB HOST : ${connections.connection.host}`);
    } catch (error) {
        console.log ("Mongodb connection failed  : ", error);
        process.exit(1);
    }
}

export default connectDB;