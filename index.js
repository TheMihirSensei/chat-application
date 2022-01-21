const express = require("express");
const path = require("path")
const { createServer } = require("http");
const socket = require("socket.io");
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()


const app = express();
const httpServer = createServer(app);
const io = socket(httpServer)

// --- user model ---- //
const userModel = require("./model/user")
const chatModel = require("./model/chat")


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(express.static(path.join(__dirname, 'public')))
io.on("connection", async (socket) => {
	let history = await chatModel.find().sort({ createdAt: 1 })
	let alltheUser = await userModel.find()
	io.emit("history", history)
	io.emit("activeUserList", alltheUser)
	// socket.on("new user", async (data) => {
	// 	console.log("emmited new user")
	// 	console.log("data: ", data)

	// 	let alltheUser = await userModel.find()
	// 	io.emit("activeUserList", alltheUser)
	// })


	socket.on("test", (data) => {
		console.log("yeah testing worked very well:)))", data)

		io.emit("sen", { me: "get lost" })
	})

	socket.on("new message", async (data) => {

		if (data) {
			console.log("data is: ", data)
			//save to  data base and send message to receiver :) 
			let newMessage = chatModel(data)
			let a = await newMessage.save()
			//send to message to reciver
			if (a) {

				io.emit("receiver msg", data)

			}
			console.log("getting all the data.....", data.receiverId, data.senderId, data.msg)
		}
		io.emit("message", { id: '1234568', message: "i don't care it's has to deliver that's all what is want." })
	})
});
app.get('/hello', (req, res, next) => {
	console.log("this is hello")
	res.sendFile(__dirname + '/public/chat.html')
})

app.post('/user', async (req, res, next) => {
	console.log("this is user")
	console.log("req.body is:L ", req.body)
	let newUser = new userModel(req.body)
	let savedUser = await newUser.save()
	res.status(200).json({ message: "user added successfully", user: savedUser })
})


app.get("/users", async (req, res) => {
	try {
		let userData = await userModel.find().sort({ user_name: 1 })
		if (userData.length > 0) {
			res.status(200).json({ messaeg: "success", data: userData })
		} else {
			res.status(404).json({ message: "no data found" })
		}
	} catch (err) {
		res.status(500).json({ message: "internal server Error", error: err?.message })
	}
})

app.get("/history", async (req, res) => {
	try {
		const senderId = req.query.senderId
		const receiverId = req.query.receiverId
		let historyData = await chatModel.find({ $or: [{ senderId: senderId, receiverId: receiverId }, { senderId: receiverId, receiverId: senderId }] }).sort({ createdAt: 1 })
		if (historyData.length > 0) {
			res.status(200).json({ data: historyData })
		} else {
			res.status(404).json({ message: "no history data found" })
		}
	} catch (err) {
		res.status(500).json({ message: "Internal Server Error", error: err?.messsage })
	}

})


mongoose.connect("mongodb+srv://mihir:mihir@chat-cluster.cs3bs.mongodb.net/chatApp?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
	if (err) {
		console.log("issue is: ", err)
	} else {
		console.log("connected mongodb")
		httpServer.listen(process.env.PORT || 5012, () => console.log("server runing"));
	}
})