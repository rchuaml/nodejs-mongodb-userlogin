const UserService = require('../services/UserService');

// file system
const fs = require('fs');

// Base url
const port = process.env.PORT || 3000;
// const baseURL = `http://localhost:${port}/api/user`;
const baseURL = 'http://testnodeapp-env.itmejkqfz2.us-east-1.elasticbeanstalk.com/api/user';

// Login
module.exports.user_login = function (req, res) {
    if (!req.body) {
        return res.status(400).json({});
    }

    // Login by using email and password
    const email = req.body.email;
    const password = req.body.password;

    UserService.VerifyUser(email, password)
        .then((doc) => {
            const context = {
                userInfo: {
                    email: doc.userInfo.email,
                    firstName: doc.userInfo.firstName,
                    lastName: doc.userInfo.lastName
                },
                token: doc.token,
                request: {
                    type: 'GET',
                    url: `${baseURL}/profile`
                }
            }
            return res.status(200).json(context);
        })
        .catch((reason) => {
            // 401 Unauthorized error
            return res.status(401).json(reason);
        });
}

// Register
module.exports.user_register = function (req, res) {
    if (!req.body) {
        return res.status(400).json({});
    }

    // User Info
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    const phoneNumber = req.body.phoneNumber;

    // date of birth format: dd/mm/yyyy
    const dateOfBirth = req.body.dateOfBirth;

    // Call service
    UserService.CreateUser(email, password, firstName, lastName, phoneNumber, dateOfBirth)
        .then((doc) => {
            const context = {
                message: 'create user succeeded',
                request: {
                    type: 'POST',
                    url: `${baseURL}/login`,
                    description: 'LOGIN'
                }
            };
            return res.status(200).json(context);
        })
        .catch((reason) => {
            return res.status(500).json(reason);
        });
}

// Access profile
module.exports.access_profile = function (req, res) {
    // Get the user id from payload
    const userId = req.userPayload.userId;
    UserService.GetUserProfile(userId)
        .then((doc) => {
            const context = {
                email: doc.email,
                firstName: doc.firstName,
                lastName: doc.lastName,
                phoneNumber: doc.phoneNumber,
                dateOfBirth: doc.dateOfBirth,
                profileImage: doc.profileImage,
                request: {
                    type: 'PUT',
                    contentType: 'multipart/form-data',
                    url: `${baseURL}/profile`,
                    body: {
                        firstName: 'String',
                        lastName: 'String',
                        phoneNumber: 'Number (8 digits)',
                        dateOfBirth: 'String (yyyy-mm-dd)',
                        profileImage: 'String(base64 jpeg or png image)'
                    },
                    description: 'UPDATE_PROFILE'
                }
            }
            return res.status(200).json(context);
        })
        .catch(err => { return res.status(500).json(err); })
}

// Check JWT from client
module.exports.auth_check = function (req, res) {
    // decoded by auth middleware
    var uId = req.userPayload.userId;
    UserService.AuthCheck(uId)
        .then(doc => {
            return res.status(200).json({ userInfo: doc });
        })
        .catch(err => {
            return res.status(401).json({ message: 'Authentication failed' });
        });
}

// Update profile
module.exports.update_profile = function (req, res) {
    if (!req.body) {
        return res.status(400).json({});
    }

    // Convert to buffer format
    var imgDataURL;
    if (req.file != null && req.file.mimetype != null) {
        // Multipurpose Internet Mail Extensions or MIME type
        // Indicates the nature and format of a document
        const mimeType = req.file.mimetype;
        if (mimeType != 'image/jpeg' && mimeType != 'image/png') {
            return res.status(400).json({ message: 'Incorrect file format' });
        }
        imgDataURL = fs.readFileSync(req.file.path).toString('base64');
        imgDataURL = `data:${mimeType};base64,${imgDataURL}`;
    } else {
        // console.log('no file');
    }

    // Payload from JWT
    const uId = req.userPayload.userId;

    // User info from body
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const dateOfBirth = req.body.dateOfBirth;

    // Call service
    UserService.UpdateUser(uId, firstName, lastName, phoneNumber, dateOfBirth, imgDataURL)
        .then((result) => {
            const context = {
                message: 'update user succeeded',
                matched: result.n,
                modified: result.nModified,
                userInfo: {
                    email: result.email,
                    firstName: result.firstName,
                    lastName: result.lastName
                },
                request: {
                    type: 'GET',
                    url: `${baseURL}/profile`
                }
            }
            // Remove file
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (fsErr) {
                    console.error(fsErr);
                }
            }
            return res.status(200).json(context);
        })
        .catch((reason) => {
            if (req.file && req.file.path) {
                try {
                    // Remove file
                    fs.unlinkSync(req.file.path);

                } catch (fsErr) {
                    console.error(fsErr);
                }
            }

            return res.status(500).json({ message: 'Update profile failed', error: reason });
        });
}

module.exports.change_password = function (req, res) {
    if (!req.body) {
        return res.status(400).json({});
    }

    // get jwt data
    const uId = req.userPayload.userId;

    const password_old = req.body.password_old;
    const password_new = req.body.password_new;

    // Call service
    UserService.ChangePassword(uId, password_old, password_new)
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            return res.status(500).json(err);
        })
}

// Retrieve image
module.exports.get_profile_img = function (req, res) {
    UserService.GetProfileImage(req.params.uId)
        .then(result => {
            return res.status(200).json({ profileImage: result.profileImage });
        })
        .catch(reason => {
            return res.status(500).json({});
        });
}