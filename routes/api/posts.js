const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    POST     api/posts/
//@desc     Create new post for a user
//@acess    private
router.post('/', [auth, [
        check('text', 'Text is required').not().isEmpty()

    ]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });
            // save new post
            const post = await newPost.save();
            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error - Post ');
        }
    });

//@route    GET     api/posts/
//@desc     Get All posts 
//@acess    private
router.get('/', auth, async(req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }); // get most recent post up
        res.send(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Post ');
    }
});

//@route    GET     api/posts/:id
//@desc     Get posts for a user by userId
//@acess    private
router.get('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error - Post ');
    }
});

//@route    DELETE     api/posts/:id    
//@desc     Get a post of a user 
//@acess    private
router.delete('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        // Check on user - delete post of that user only who is logged in
        if (post.user.toString() != req.user.id) {
            return res.status(404).json({ msg: 'User not authorized to delete the Post' });
        }
        await post.remove();
        res.json({ msg: 'Post removed' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error - Post ');
    }
});

//@route    PUT     api/posts/like/:id    
//@desc     LIKE a post of a user , Update that POST
//@acess    private
router.put('/like/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post is already liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "Post already liked" });
        }

        // when not liked, update likes array with user id who like it
        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Like ');
    }
});

//@route    PUT     api/posts/unlike/:id    
//@desc     UNLIKE a post of a user , Update that POST
//@acess    private
router.put('/unlike/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post is already liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "Post has not yet been Liked" });
        }

        const removeIndex = post.likes.map(like => like.user.toString())
            .indexOf(req.user.id);

        // when liked earlier, remove like with user id who liked it and now unliking it
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - UnLike ');
    }
});

//@route    POST     api/posts/comment/:id
//@desc     Create new comment for a user
//@acess    private
router.post('/comment/:id', [auth, [
        check('text', 'Comment is required').not().isEmpty()

    ]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };
            // save new comment
            post.comments.unshift(newComment);
            await post.save();

            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error - Add Comment ');
        }
    });

//@route    DELETE    api/posts/comment/:id/:comment_id
//@desc     DELETE new comment of a POST , for a user
//@acess    private
router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
    try {
        // Get Post
        const post = await Post.findById(req.params.id);

        // Get Comment from that post
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exists' });
        }

        // Check user that deleting the comment is the user that made the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not Authorized to delete the comment' });
        }

        const removeIndex = post.comments.map(comment => comment.user.toString())
            .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Delete Comment ');
    }
});

module.exports = router;