import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/ ${DB_NAME}`);
        console.log("\n Mongodb is connected .. DB HOST : ${connection.connection.host} ");
    } catch (error) {
        console.log ("Error is : ", error);
        process.exit(1)
    }
}

export default connectDB;