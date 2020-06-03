const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs'); // for encryption of password
const jwt = require('jsonwebtoken');
const User = require('../../models/Users'); // Get User Model
const config = require('config');

//@route    POST     api/users/
//@desc     Register user
//@acess    Public

//Add parameters to post request - validation
router.post('/', [
        check('name', 'Name is required')
        .not()
        .isEmpty(),
        check('email', 'Please enter a valid Email ').isEmail(),
        check('password', 'Please enter a password with minimum 6 or more characters').isLength({ min: 6 })
    ],

    async(req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // return error array and set BAD status
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body;
        try {

            // Check if User exists 
            let user = await User.findOne({ email: email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User Already exists' }] });
            }
            // Get users gravatar using their email ID
            // pass email to search and three params string length (s), r for rating (no objectionable pic), d for getting default pic
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });
            user = new User({
                name,
                password,
                email,
                avatar
            });

            // Encypt the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save(); // save to DB

            // Return the json web token for the user
            const payload = {
                user: {
                    id: user.id
                }
            };

            const secret = config.get('jwtSecret');
            console.log(secret + " is secret");
            jwt.sign(
                payload,
                secret, { expiresIn: 360000 },
                (err, token) => {
                    if (error) throw error;
                    console.log(token);
                    res.json({ token }); // get token, send to client
                }
            );

            //  res.send('User Registered');

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error - Users');
        }

    }

);

module.exports = router;