const { Schema, model } = require("mongoose")


const user = new Schema({
	user_name: {
		type: String,
		required: true
	}
}, { timestamps: true })

module.exports = model("User", user)