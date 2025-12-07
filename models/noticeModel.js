const mongoose = require("mongoose");

const noticeSchema = mongoose.Schema(
    {
        title: { 
            type: String, 
            require: true 
        },
        content: { 
            type: String, 
            require: true 
        },
        author: { type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    },
    { 
        timeStamps: true 
    }
);

module.exports = mongoose.model("Notice", noticeSchema);