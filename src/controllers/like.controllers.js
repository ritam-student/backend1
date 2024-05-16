import { asyncHandler } from "../utils/asyncHandler";
import { Apiresponse } from "../utils/Apiresponse";
import { ApiError } from "../utils/apiError";
import { Like } from "../models/like.models";
import { Video } from "../models/video.models";
import { Comment } from "../models/comment.models";
import { Tweet } from "../models/tweet.models";
import { User } from "../models/user.models";

const toggleVideoLike = asyncHandler (async (req, res) => {
    const {videoId} = req.params;
    // toggle like on video
    if (!videoId) {
        throw new ApiError(401, "video doesnot exist publically...")
    }
    const likedDetails = await Video.aggregate([
        {
            $match: {
                _id: videoId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likedUser"
            }
        },
        {
            isLiked: {
                $cond: {
                    if: {$in: [req.user?._id, "$likedUser.likedBy"]},
                    then: true ,
                    else: false
                }
            }
        },
    ])
})


const toggleCommentLike = asyncHandler( async (req, res) => {
    const {commentId} = req.params;
    // toggle like on comment
    if (!commentId) {
        throw new ApiError(401, "video doesnot exist publically...")
    }
    const commentDetails = await Comment.aggregate([
        {
            $match: {
                _id: commentId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likedUser"
            }
        },
        {
            isLiked: {
                $cond: {
                    if: {$in: [req.user?._id, "$likedUser.likedBy"]},
                    then: true ,
                    else: false
                }
            }
        },
    ])
})



const  toggleTweetLike = asyncHandler (async (req, res) => {
    const {tweetId} = req.params;
    // toggle like on tweet
    if (!tweetId) {
        throw new ApiError(401, "video doesnot exist publically...")
    }
    const likedDetails = await Tweet.aggregate([
        {
            $match: {
                _id: tweetId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "weet",
                as: "likedUser"
            }
        },
        {
            isLiked: {
                $cond: {
                    if: {$in: [req.user?._id, "$likedUser.likedBy"]},
                    then: true ,
                    else: false
                }
            }
        },
    ])
})


/**const getLikedVideos = asyncHandler (async (req, res) => {
    // get all liked videos
    const user = req.user;
    if(!user) {
        throw new ApiError(401, "user doesnot exist");
    }

    const likedDetails = await User.aggregate ([
        {
            $match: {
                _id: "user?._id"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: ""
            }
        },
        {}
    ])
})
*/



export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    //getLikedVideos
}