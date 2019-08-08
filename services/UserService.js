const UserModel = require('../models/UserDTO');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define the salt rounds for bcrypt
const saltRounds = 10;

class UserService {
    // Create
    static CreateUser(email, plaintextPassword, firstName, lastName, phoneNumber, dateOfBirth) {
        var promise = UserModel.findOne({ email: email })
            .exec()
            .then((user) => {
                // do not allow duplicate email
                if (!user) {
                    // Hash password
                    return bcrypt.hash(plaintextPassword, saltRounds)
                        .then((hashedPassword) => {
                            // hash success
                            // Create instance
                            const instance = new UserModel({
                                email: email,
                                password: hashedPassword,
                                firstName: firstName,
                                lastName: lastName,
                                phoneNumber: phoneNumber,
                                dateOfBirth: dateOfBirth
                            });
                            return instance.save();
                        }).catch((err) => {
                            return Promise.reject(err);
                        });
                }
                else {
                    return Promise.reject({ 'error': 'email already used' });
                }
            })
        return promise;
    }

    // Login
    static VerifyUser(email, plaintextPassword) {
        var promise = UserModel.findOne({ email: email })
            .select('_id email password firstName lastName')
            .exec()
            .then((doc) => {
                if (!doc) {
                    return Promise.reject({ error: 'account not exist' });
                }

                return bcrypt.compare(plaintextPassword, doc.password)
                    .then((comparedResult) => {
                        if (!comparedResult) {
                            return Promise.reject({ message: 'wrong password' });
                        }

                        try {
                            // process.env.JWT_PRIV_KEY
                            const secret = process.env.JWT_PRIV_KEY || 'secret';

                            // (Synchronous) Returns the JsonWebToken as string
                            const token = jwt.sign({
                                userId: doc._id,
                                email: doc.email
                            }, secret, { expiresIn: '1h' });

                            var context = {
                                userInfo: doc,
                                token: token
                            };
                            return Promise.resolve(context);
                        }
                        catch (signErr) {
                            return Promise.reject({ message: 'jwt sign error', signErr: signErr });
                        }
                    })
            });
        return promise;
    }

    // Retrieve
    static GetUserProfile(uId) {
        var query = UserModel.findById(uId);
        return query.exec();
    }

    // Update
    static UpdateUser(userId, email, plaintextPassword, firstName, lastName, phoneNumber, dateOfBirth, profileImage) {
        var promise = bcrypt.hash(plaintextPassword, saltRounds)
            .then((hashedPassword) => {
                // Update to database
                var query = UserModel.updateOne({ '_id': userId }, {
                    email: email,
                    password: hashedPassword,
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    dateOfBirth: dateOfBirth,
                    profileImage: profileImage
                });
                return query.exec();
            }).catch((err) => {
                return Promise.reject(err);
            });
        return promise;
    }

    // Delete
    static DeleteUser(userId) {
        var query = UserModel.deleteOne({ '_id': userId });
        var promise = query.exec();
        return promise;
    }
}

module.exports = UserService;