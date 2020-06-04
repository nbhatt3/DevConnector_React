const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

const User = require('../../models/User'); // Get User Model
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

//@route    GET     api/auth/
//@desc     TEST roue, check token in header and if present and valid , get user details - LOGIN purpose
//@acess    Public

//make this route protected by using auth as 2nd parameter 
router.get('/', auth, async(req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log(user);
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//@route    POST     api/auth/
//@desc     Authenticate user and get token - this page is also used for LOGIN purpose
//@acess    Public

router.post('/', [
        check('email', 'Please enter a valid Email ').isEmail(),
        check('password', 'Password is required ').exists()
    ],
    async(req, res) => {
        console.log(req.body);
        console.log("In POST AUTH");
        const errors = validationResult(req);
        console.log(errors);

        if (!errors.isEmpty()) { // return error array and set BAD status
            return res.status(400).json({ errors: errors.array() })
        }

        // check email and password entered by user for LOGIN purpose
        const { email, password } = req.body;
        try {

            // Check in DB for Login purpose, if User does not exists in DB  
            let user = await User.findOne({ email: email });
            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentails ' }] });
            }

            // compare user entered password and encrypted password from DB for same username
            const isMatch = await bcrypt.compare(password, user.password);

            // Password does not match
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid Credentails ' }] });
            }

            //  payload- json web token for the user
            const payload = {
                user: {
                    id: user.id
                }
            };

            const secret = config.get('jwtSecret');
            console.log(secret + " is secret");

            jwt.sign(
                payload,
                secret, { expiresIn: '12 days' },
                (error, token) => {
                    if (error) throw error;
                    // console.log(token);
                    res.json({ token }); // send token to client
                });

            //  res.send('User Registered');

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error - auth');
        }
    }
);

module.exports = router;