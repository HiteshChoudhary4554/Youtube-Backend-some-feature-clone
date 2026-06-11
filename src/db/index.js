import mongoose from "mongoose";
import { DB_Name } from '../constent.js'

async function dbConnect (){
    try {        
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log("Database connected successfully : ", connectionInstance.connection.host);
        
    } catch (error) {
        console.log("error db -> index.js :-> ",error);
        process.exit(1);
        throw error 
    }
}

export default dbConnect;