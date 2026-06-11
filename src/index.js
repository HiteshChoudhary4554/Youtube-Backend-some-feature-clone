import dbConnect from './db/index.js'
import dotenv from 'dotenv'
import { app } from './app.js'

dotenv.config({ path: './.env' })

dbConnect()
.then(() => {
     app.on("error",(err)=>{
        console.log("error src/index.js connection failed ",err);
        throw err
     })
     const PORT = process.env.PORT || 8000;
     app.listen(PORT,(req, res) => {
        console.log("server listen on PORT : ",PORT);
     })
})
.catch((err) =>{
    console.log("MONGO db connecation failed!!! ", err);
})

/*const app = express()
;( async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
        app.on("error",(error) => {
            console.log("Index.js error : ", error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log("request listening in port ",process.env.PORT);
        })
    } catch (error) {
        console.error("Index.js error : ", error);
        throw error;
    }

} )();*/