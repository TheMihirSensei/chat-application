const express = require("express");
const path = require("path")
const { createServer } = require("http");
const socket = require("socket.io");
const mongoose = require("mongoose")


const app = express();
const httpServer = createServer(app);
const io = socket(httpServer)

// --- user model ---- //
const userModel = require("./model/user")
const chatModel = require("./model/chat")


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))
io.on("connection", async (socket) => {
	let history = await chatModel.find().sort({ createdAt: 1 })
	socket.emit("history", history)

	socket.on("newUser", async (data) => {
		console.log("emmited new user")
		console.log("data: ", data)

		let alltheUser = await userModel.find()
		io.emit("activeUserList", alltheUser)
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

const port = 5012


mongoose.connect("mongodb://127.0.0.1:27017/otmChat", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
	if (err) {
		console.log("issue is: ", err)
	} else {
		console.log("connected mongodb")
		httpServer.listen(port, () => console.log("server runing"));
	}
})