import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db/dbConnection.js';
import CaptainRoute from './Routes/captain.js'
import { connect } from './Service/rabbit.js';
const app = express()

dotenv.config();

app.use(cors("*"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


connectDB()
connect()



app.get('/', (req,res)=>{
	res.send({
		status:true,
		message:"Working"
	})
})


app.use('/',CaptainRoute)
app.listen(3002,()=>{
	console.log("Captain Server is running on port 3002")
})