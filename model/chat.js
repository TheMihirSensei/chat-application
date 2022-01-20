const { Schema, model } = require("mongoose")


const chat = new Schema({
	senderId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	receiverId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	msg: {
		type: String,
		required: true
	}
}, { timestamps: true })

module.exports = model("Chat", chat)