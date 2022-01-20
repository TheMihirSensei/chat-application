let username = document.getElementById("username")
let sendButton = document.getElementById("btnSubmit")


sendButton.addEventListener("click", async (e) => {
	try {
		console.log("e is: ", e)
		e.preventDefault()
		let userName = username.value
		username.innerHTML = ''
		console.log("userName: ", userName)
		let data = await fetch('http://localhost:5012/user', {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_name: userName,
				somedata: "this is real me"
			})
		})
		let response = await data.json()
		console.log("response is: ", response)
		localStorage.setItem("userId", response.user._id)
		localStorage.setItem("userName", response.user.user_name)
		location.href = 'http://localhost:5012/chat.html'
	} catch (err) {
		console.log("error", err)
		alert("somethign went wrong please refresh the page: " + JSON.stringify(err))
	}

})






