const jwt = require('jsonwebtoken');
const config = require('../config/default');

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
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is Not valid' });
    }


}