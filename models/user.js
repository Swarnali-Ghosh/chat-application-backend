import { hash } from "bcrypt";
import mongoose, { Schema, model } from "mongoose";

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        // required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});
// what is the purpose ? when a new user register then hash password save to database.
schema.pre("save", async function (next) {

    // If password not modified then call next middleware
    if (!this.isModified("password")) return next();

    this.password = await hash(this.password, 10);
})

export const User = mongoose.models.User || model("User", schema);