const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return res.status(401).json({ 'message': 'No Token or Bearer found in headers' });
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_PRIV_KEY || 'secret';

        // Token contains userId and email
        if (token) {
            // verify a token symmetric - synchronous
            var decoded = jwt.verify(token, secret);
            req.userPayload = decoded;
            next();
        }
    }
    catch (err) {
        return res.status(401).json({ 'message': 'Authentication failed' });
    }
}

