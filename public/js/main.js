const socket = io()
const chatContainer = document.getElementById("chat-container");
const btnSubmit = document.getElementById("btnSubmit");
const domUser = document.getElementById("users");
const sendMsg = document.getElementById("msg");



(() => {
	let userId = localStorage.getItem("userId")
	let receiverId = localStorage.getItem("receiverId")
	let userName = localStorage.getItem("userName")
	let receiverName = JSON.parse(localStorage.getItem("activeUser")).filter(user => user._id === receiverId)[0].user_name
	socket.userId = localStorage.getItem("userId")

	//first user arrive to chat
	socket.emit("newUser", { userId: localStorage.getItem("userId"), userName: localStorage.getItem("userName") })
	//for getting user all the history with specific user
	socket.on("history", (data) => {
		console.log(" all history of msg, ", data)

		let actualHistory = data.filter(chat => {
			return (chat.senderId === userId && chat.receiverId === receiverId) || (chat.senderId === receiverId && chat.receiverId === userId)
		})

		actualHistory.forEach(chat => {
			let name = (chat.senderId === userId) ? userName : receiverName
			let cssClass = (chat.senderId === userId) ? "right" : "left"
			addElem(name, chat.msg, chat.createdAt, cssClass)
		})
		console.log("history of msg, ", actualHistory)
	})

	let domUserEle = document.getElementById(receiverId)
	domUserEle.classList.add('active')
	// const domUserLabel = document.getElementById("userLabel")
	// domUserLabel.innerHTML = receiverName

})();


const addElem = (senderName, msg, date, cssClass) => {
	let divMsg = document.createElement("div");
	divMsg.classList.add("message")
	divMsg.classList.add(cssClass)
	divMsg.innerHTML = `<p class="meta">${senderName} <span>${date || new Date().toLocaleTimeString()}</span></p>
							<p class="text">
								${msg}
							</p>`

	chatContainer.appendChild(divMsg)
}




//will implement when user selected receiver and want to send the message
// const createRoom = (receiverId) => {
// 	let senderId = localStorage.getItem('userId')
// 	room = Date.now() + Math.random();
// 	socket.emit('create', { room, senderId, receiverId })
// }

socket.on("activeUserList", (data) => {
	//add the active user in local storage and update dom elements

	console.log("data is: ", data)

	//userID, userName
	let userID = localStorage.getItem("userId")
	let currentUser = data.filter(user => user._id !== userID)

	localStorage.setItem('activeUser', JSON.stringify(currentUser))
	// console.log("setItem localstorag is called: ", localStorage.getItem("activeUser"))
	let innerText = ""
	currentUser.forEach(user => {
		innerText += "<li class='user' onclick='chatWithUser(event)' id=" + user._id + " value=" + user._id + ">" + user.user_name + "</li>"
	})


	domUser.innerHTML = innerText
})

socket.on("receiver msg", (data) => {
	const userId = localStorage.getItem("userId")
	if (data.receiverId === userId) {
		//dom add the message
		let senderName = JSON.parse(localStorage.getItem("activeUser")).filter(user => user._id === data.senderId)[0].user_name
		addElem(senderName, data.msg, "left")

	}
})

btnSubmit.addEventListener("click", (e) => {
	e.preventDefault()
	let msg = sendMsg.value
	console.log("msg iss::::", msg)
	let senderId = localStorage.getItem("userId")
	let userName = localStorage.getItem("userName")
	let receiverId = localStorage.getItem("receiverId")
	socket.emit('new message', { senderId: senderId, receiverId: receiverId, msg: msg })
	addElem(userName, msg, new Date().toLocaleTimeString(), "right")
	sendMsg.value = ''


})

const chatWithUser = (e) => {
	localStorage.setItem("receiverId", e.target.id)
	const userLabel = JSON.parse(localStorage.getItem('activeUser')).filter(user => user._id === e.target.id)[0].user_name
	const domUserLabel = document.getElementById("userLabel")
	const domUser = document.getElementById(e.target.id)
	//remove active class from the others... 
	const activeClassEle = document.getElementsByClassName("active")
	for (const item of activeClassEle) {
		item.classList.remove("active")
	}
	domUser.classList.add('active')
	domUserLabel.innerHTML = userLabel
}

