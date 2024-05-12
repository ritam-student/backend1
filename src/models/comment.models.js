import mongoose from "mongoose";
import  mongooseAggregatePaginate  from "mongoose-aggregate-paginate-v2";

const commentsSchema = new mongoose.Schema({
    content : {
        type: String,
        required: true
    },
    video: {
        type: mongoose.model.Types.ObjectId,
        ref: "Video",
        required : true
    },
    owner: {
        type: mongoose.model.Types.ObjectId,
        ref: "User",
        required : true
    }
},
{timestamps: true}
);

commentsSchema.plugin(mongooseAggregatePaginatev2);

export const Comment = mongoose.model("Comment", commentsSchema)
