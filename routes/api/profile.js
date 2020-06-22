const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

const { check, validationResult } = require('express-validator/check');
const request = require('request');
const config = require('config');

const Post = require('../../models/Post')

//@route    GET     api/profile/me  - Get my profile
//@desc     Get Current User's profile
//@acess    Private ( use token to validate and get profile of a user)

router.get('/me', auth, async(req, res) => {

    // Get profile based on userID obtained in auth , and get name,avatar too
    try {

        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user', ['name', 'avatar']
        );

        if (!profile) {
            return res.status(400).json({ msg: 'There is no Profile for this user' });
        }

        // when profile is obtained successfully, return it
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Profile');
    }

});

//@route    POST     api/profile/  - 
//@desc     Create or update  User's profile
//@acess    Private 
router.post('/', [auth, [
        check('status', 'Status is required')
        .not()
        .isEmpty(),
        check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;

        // Build Profile object
        const profileFields = {};
        profileFields.user = req.user.id;

        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;

        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        console.log(profileFields.skills);

        // Build Social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // profile exists, Update Profile
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }

            // Create profile
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error - Profile');
        }
    });

//@route    GET    api/profile/  - 
//@desc     Get all Profiles
//@acess    Public

router.get('/', async(req, res) => {
    // Get all profiles 
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error- Profiles');
    }
});

//@route    GET    api/profile/user/:user_id  - 
//@desc     Get Profile by UserId
//@acess    Public

router.get('/user/:user_id', async(req, res) => {
    // Get a profile of a user ,using userId 
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error- Profiles');
    }
});

//@route    DELETE    api/profile/  - 
//@desc     Delete  a profile, user and posts
//@acess    Private
router.delete('/', auth, async(req, res) => {
    // Remove profile
    // Remove users and posts 
    try {
        // Remove user Post first
        await Post.deleteMany({ user: req.user.id });
        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove User
        await User.findOneAndRemove({ _id: req.user.id });

        console.log("Profile and User deleted");
        res.json({ msg: 'User Removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error- Profile Delete');
    }
});

//@route    PUT    api/profile/experience  - 
//@desc     ADD  profile experience
//@acess    Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp); // most recent first 
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Put');
    }

});

//@route    DELETE    api/profile/experience/:exp_id  - 
//@desc     DELETE  profile experience
//@acess    Private
router.delete('/experience/:exp_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // get experience to remove
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error - Delete Experience');
    }
});


//@route    PUT    api/profile/education  - 
//@desc     ADD    profile education
//@acess    Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school: school,
        degree: degree,
        fieldofstudy: fieldofstudy,
        from: from,
        to: to,
        current: current,
        description: description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu); // most recent added first 
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Put Edu');
    }

});

//@route    DELETE    api/profile/education/:edu_id  - 
//@desc     DELETE  profile education
//@acess    Private
router.delete('/education/:edu_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // get education to remove
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error - Delete Education');
    }
});


//@route    GET     api/profile/github/:username  - 
//@desc     GET     get user repos from Github
//@acess    Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };
        request(options, (error, response, body) => {
            if (error) console.log(error);
            if (response.statusCode !== 200) {
                res.status(404).json({ msg: 'No Github Profile found' });
            }

            res.json(JSON.parse(body));
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error - Github Repos');
    }
});

module.exports = router;