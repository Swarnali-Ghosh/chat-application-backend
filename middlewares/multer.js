import multer from "multer";
// storage দুই ধরনের হয় 1. Memory (মানে RAM - It is temporary storage) 2. DiskStorage ( the total amount of data that a hard disk or hard drive can store.)
const multerUpload = multer({
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
    }
});

const singleAvatar = multerUpload.single("avatar");

const attachmentMulter = multerUpload.array("files", 5);

export { singleAvatar, attachmentMulter };