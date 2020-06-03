const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/Users'); // Get User Model
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

//@route    POST     api/auth/
//@desc     Authenticate user and get token
//@acess    Public

//make route protected by using auth in parameter (from middleware)
router.get('/', auth, async(req, res) => {

    // return the user from DB
    try {
        const user = await (await User.findById(req.user.id)).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error -auth');

    }

});

router.post('/', [
        check('email', 'Please enter a valid Email ').isEmail(),
        check('password', 'Password is required ').exists
    ],

    async(req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // return error array and set BAD status
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;
        try {

            // Check in DB for Login purpose, if User does not exists in DB  
            let user = await User.findOne({ email: email });
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentails ' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            // password does not match
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentails ' }] });
            }

            // Return the json web token for the user
            const payload = {
                user: {
                    id: user.id
                }
            };

            const secret = config.get('jwtSecret');
            console.log(secret + " is secret");
            jwt.sign(payload,
                secret, { expiresIn: 360000 },
                (err, token) => {
                    if (error) throw error;
                    console.log(token);
                    res.json({ token }); // get token, send to client
                });

            //  res.send('User Registered');

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error - Users');
        }
    }

);

module.exports = router;