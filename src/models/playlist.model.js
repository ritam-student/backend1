import mongoose from "mongoose";

const playlistSchema = new mongoose.model(
    {
        name: {
            type : String ,
            required: true
        },
        description : {
            type : String 
        },
        videos: [
            {
                type : mongoose.model.Types.ObjectId,
                ref: "Video",
            }
        ],
        owner : {
            type : mongoose.model.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true 
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema);