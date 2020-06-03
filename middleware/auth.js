const jwt = require('jsonwebtoken');
const config = require('config');

// Making an auth which can be used in each route such as api/users/, api/auth etc.
module.exports = function(req, res, next) {

    // Get token from header of request 
    const token = req.header('x-auth-token');

    // check if No token found in header
    if (!token) {
        return res.status(401).json({ msg: 'No Token found, Authorization denied' });
    }

    // verify token, when found in header
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        // console.log(req.user);
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};