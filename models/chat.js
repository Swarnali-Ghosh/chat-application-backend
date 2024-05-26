import mongoose, { Schema, Types, model } from "mongoose";

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    groupChat: {
        type: Boolean,
        default: false
    },
    creator: { // only for group chat
        type: Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            type: Types.ObjectId,
            ref: "User"
        }
    ]
}, {
    timestamps: true
});

export const Chat = mongoose.models.Chat || model("Chat", schema);