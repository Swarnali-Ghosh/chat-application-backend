import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, renameGroup, sendAttachments } from "../controllers/chat.js";
import { attachmentMulter } from "../middlewares/multer.js";
import { addMemberValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validateHandler } from "../lib/validator.js";

const app = express.Router();

// create group chat
app.use(isAuthenticated)

app.post("/new", newGroupValidator(), validateHandler, newGroupChat);

app.get("/my", getMyChats)

app.get("/my/groups", getMyGroups)

app.put("/addmembers", addMemberValidator(), validateHandler, addMembers)

app.put("/removemember", removeMemberValidator(), validateHandler, removeMember)

app.delete("/leave/:id", leaveGroup)

// send attachments
app.post("/message", attachmentMulter, sendAttachmentsValidator(), validateHandler, sendAttachments)

// gets messages
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages);


// Get Chat Details, rename,delete
app
    .route("/:id")
    .get(
        chatIdValidator(),
        validateHandler,
        getChatDetails)
    .put(
        renameValidator(), validateHandler,
        renameGroup)
    .delete(
        chatIdValidator(), validateHandler,
        deleteChat);

export default app;