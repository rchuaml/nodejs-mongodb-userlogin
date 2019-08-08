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
            return res.status(500).json(reason);
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
                        password: 'String',
                        firstName: 'String',
                        lastName: 'String',
                        phoneNumber: 'Number',
                        dateOfBirth: 'String',
                        profileImage: 'Buffer'
                    },
                    description: 'UPDATE_PROFILE'
                }
            }
            return res.status(200).json(context);
        })
        .catch(err => { return res.status(500).json(err); })
}

// Update profile
module.exports.update_profile = function (req, res) {
    if (!req.body) {
        return res.status(400).json({});
    }

    // Convert to buffer format
    var imgBuffer;
    if (req.file != null) {
        imgBuffer = fs.readFileSync(req.file.path);
    }

    // Payload from JWT
    const uId = req.userPayload.userId;
    const email = req.userPayload.email;

    // User info from body
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const dateOfBirth = req.body.dateOfBirth;

    // Call service
    UserService.UpdateUser(uId, email, password, firstName, lastName, phoneNumber, dateOfBirth, imgBuffer)
        .then((result) => {
            const context = {
                message: 'update user succeeded',
                matched: result.n,
                modified: result.nModified,
                userInfo: {
                    firstName: firstName,
                    lastName: lastName
                },
                request: {
                    type: 'GET',
                    url: `${baseURL}/profile`
                }
            }

            if (req.file && req.file.path) {
                try {
                    // Remove file
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

            return res.status(500).json(reason);
        });
}

