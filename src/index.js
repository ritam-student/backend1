
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config ({
    path : "./env"
});

connectDB()
.then(() => {
    app.on ("error", (err) => {
        console.log ("error is : ", err);
    })
    app.listen (process.env.PORT || 5000 , () => {
        console.log(`server is running at port :  $  {process.env.PORT} `);
    })
})
.catch((err) => {
    console.log("MongoDB connection failed ... ", err);
});
