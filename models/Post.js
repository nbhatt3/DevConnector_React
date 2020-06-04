const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: { // name of post
        type: String
    },
    avatar: {
        type: String
    },
    likes: [ // Array of user-ids
        { // posts like by users - which like came from which user
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        text: { type: String, require: true },
        date: {
            type: Date,
            default: Date.now
        },
        name: { // name of post
            type: String
        },
        avatar: {
            type: String
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = Post = mongoose.model('post', PostSchema);