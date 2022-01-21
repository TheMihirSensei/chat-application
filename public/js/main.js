const socket = io();
const chatContainer = document.getElementById("chat-container");
const btnSubmit = document.getElementById("btnSubmit");
const domUser = document.getElementById("users");
const sendMsg = document.getElementById("msg");

const addElem = (senderName, msg, date, cssClass) => {
	let divMsg = document.createElement("div");
	divMsg.classList.add("message");
	divMsg.classList.add(cssClass);
	divMsg.innerHTML = `<p class="meta">${senderName} <span>${date || new Date().toLocaleTimeString()
		}</span></p>
							<p class="text">
								${msg}
							</p>`;

	chatContainer.appendChild(divMsg);
};

// add the users to the side panel
const addUserDom = (users) => {
	const domUser = document.getElementById("users");
	let innerText = ''

	users.forEach((user) => {
		innerText +=
			"<li class='user' onclick='chatWithUser(event)' id=" +
			user._id +
			" value=" +
			user._id +
			">" +
			user.user_name +
			"</li>";
	});

	domUser.innerHTML = innerText
};

const chatWithUser = (e) => {
	localStorage.setItem("receiverId", e.target.id);
	let userId = localStorage.getItem("userId")

	console.log("target userId", e.target.id)
	console.log(JSON.parse(localStorage.getItem("activeUser")))
	const userLabel = JSON.parse(localStorage.getItem("activeUser")).filter(
		(user) => user._id === e.target.id
	)[0].user_name;
	const domUserLabel = document.getElementById("userLabel");
	const domUser = document.getElementById(e.target.id);
	//remove active class from the others...
	const activeClassEle = document.getElementsByClassName("active");
	for (const item of activeClassEle) {
		item.classList.remove("active");
	}
	domUser.classList.add("active");
	domUserLabel.innerHTML = userLabel;

	//get history of receiver and sender and change the dom according to it. 
	fetch(`http://localhost:5012/history?senderId=${userId}&receiverId=${e.target.id}`)
		.then((res) => {
			if (!res.ok) {
				throw Error(res.statusText)
			}
			return res.json()
		})
		.then(res => {
			if (res.data && res.data?.length > 0) {
				let receiverId = localStorage.getItem("receiverId")
				console.log("ohk history data: ", res.data)
				chatContainer.innerHTML = ""
				res.data.forEach(chat => {
					let receiverName = JSON?.parse(localStorage.getItem("activeUser"))?.filter(
						(user) => user._id === receiverId
					)[0].user_name;
					let userName = localStorage.getItem("userName")
					let name = chat.senderId === userId ? userName : receiverName;
					let cssClass = chat.senderId === userId ? "right" : "left";
					console.log("name si: ", name, "user calas alls", cssClass)

					addElem(name, chat.msg, chat.createdAt, cssClass);

				})
			} else {
				chatContainer.innerHTML = ""
			}

		})
		.catch(err => {
			console.log("come here error: ", err)
			chatContainer.innerHTML = ""
		})
};


(() => {
	let userId = localStorage.getItem("userId");
	let receiverId = localStorage.getItem("receiverId");
	let userName = localStorage.getItem("userName");
	socket.userId = localStorage.getItem("userId");

	//first user arrive to chat

	let userWith = document.getElementById("userWith")
	userWith.innerHTML += ` ${userName}`

	socket.emit("newUser", {
		userId: localStorage.getItem("userId"),
		userName: localStorage.getItem("userName"),
	});
	if (!receiverId) {
		console.log("did not able to receive:::");
	} else {

		fetch("http://localhost:5012/users")
			.then((res) => res.json())
			.then((data) => {
				console.log("finally tdata is: ", data);
				//add active users to local storage


				let currentUser = data.data.filter((user) => user._id !== userId);
				addUserDom(currentUser)

				//setactive user to localStorage
				localStorage.setItem('activeUser', JSON.stringify(currentUser))

				let receiverName = JSON?.parse(localStorage.getItem("activeUser"))?.filter(
					(user) => user._id === receiverId
				)[0].user_name;

				//for getting user all the history with specific user
				socket.on("history", (data) => {
					let actualHistory = data.filter((chat) => {
						return (
							(chat.senderId === userId && chat.receiverId === receiverId) ||
							(chat.senderId === receiverId && chat.receiverId === userId)
						);
					});

					actualHistory.forEach((chat) => {
						let name = chat.senderId === userId ? userName : receiverName;
						let cssClass = chat.senderId === userId ? "right" : "left";
						addElem(name, chat.msg, chat.createdAt, cssClass);
					});
				});
				document.getElementById(receiverId).classList.add("active")
				document.getElementById("userLabel").innerHTML = receiverName;
			})
			.catch((err) => {
				console.log("soemthing went wrong", err);
			});


		// get all the active User and add to dom element
	}

	//get all the active the user and add to the userElement

})();

//will implement when user selected receiver and want to send the message
// const createRoom = (receiverId) => {
// 	let senderId = localStorage.getItem('userId')
// 	room = Date.now() + Math.random();
// 	socket.emit('create', { room, senderId, receiverId })
// }

socket.on("activeUserList", (data) => {
	//add the active user in local storage and update dom elements



	//userID, userName
	let userID = localStorage.getItem("userId");
	let currentUser = data.filter((user) => user._id !== userID);

	localStorage.setItem("activeUser", JSON.stringify(currentUser));
	// console.log("setItem localstorag is called: ", localStorage.getItem("activeUser"))
	addUserDom(currentUser)
	let receiverId = localStorage.getItem("receiverId")
	if (receiverId) {
		document.getElementById(receiverId).classList.add("active")
	}


});

socket.on("receiver msg", (data) => {
	const userId = localStorage.getItem("userId");
	if (data.receiverId === userId) {
		//dom add the message
		let senderName = JSON.parse(localStorage.getItem("activeUser")).filter(
			(user) => user._id === data.senderId
		)[0].user_name;
		addElem(senderName, data.msg, new Date().toLocaleTimeString(), "left");
	}
});

btnSubmit.addEventListener("click", (e) => {
	e.preventDefault();
	let msg = sendMsg.value;
	let senderId = localStorage.getItem("userId");
	let userName = localStorage.getItem("userName");
	let receiverId = localStorage.getItem("receiverId");
	socket.emit("new message", {
		senderId: senderId,
		receiverId: receiverId,
		msg: msg,
	});
	addElem(userName, msg, new Date().toLocaleTimeString(), "right");
	sendMsg.value = "";
});

