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
                    return Promise.reject({ message: 'This email has been used' });
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
                    return Promise.reject({ message: 'Account not exist' });
                }

                return bcrypt.compare(plaintextPassword, doc.password)
                    .then((comparedResult) => {
                        if (!comparedResult) {
                            return Promise.reject({ message: 'Wrong password' });
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
                            return Promise.reject({ message: 'Sign JWT error', signErr: signErr });
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

    static AuthCheck(uId) {
        var query = UserModel.findById(uId).select('email firstName lastName');
        return query.exec();
    }

    // Update
    static UpdateUser(userId, firstName, lastName, phoneNumber, dateOfBirth, profileImage) {

        var promise = UserModel.findById(userId)
            .select('email firstName lastName phoneNumber dateOfBirth profileImage')
            .exec()
            .then((doc) => {
                doc.firstName = firstName;
                doc.lastName = lastName;
                doc.phoneNumber = phoneNumber;
                doc.dateOfBirth = dateOfBirth;
                doc.profileImage = profileImage;
                return doc.save();
            });
        return promise;

        // var promise = bcrypt.hash(plaintextPassword, saltRounds)
        //     .then((hashedPassword) => {
        //         // Update to database
        //         var query = UserModel.updateOne({ '_id': userId }, {
        //             email: email,
        //             password: hashedPassword,
        //             firstName: firstName,
        //             lastName: lastName,
        //             phoneNumber: phoneNumber,
        //             dateOfBirth: dateOfBirth,
        //             profileImage: profileImage
        //         });
        //         return query.exec();
        //     }).catch((err) => {
        //         return Promise.reject(err);
        //     });
        // return promise;
    }

    // Change account password
    static ChangePassword(uId, oldPassword, newPassword) {
        return UserModel.findById(uId)
            .select('_id password')
            .exec()
            .then(doc => {
                return bcrypt.compare(oldPassword, doc.password)
                    .then(onfulfilled => {
                        if (!onfulfilled) {
                            return Promise.reject({ message: 'Original password is wrong' });
                        }

                        let hashPromise = bcrypt.hash(newPassword, saltRounds)
                            .then(newHashedPassword => {
                                // Operate the doc object directly (modify only certain fields)
                                doc.password = newHashedPassword;
                                return doc.save()
                                    .then(saveResult => {
                                        return Promise.resolve({ message: "Change password succeeded" })
                                    })
                                    .catch(saveError => {
                                        return Promise.reject({ message: 'Change password failed', error: saveError });
                                    });
                            })
                        return hashPromise;
                    })
            })
    }

    // Delete
    static DeleteUser(userId) {
        var query = UserModel.deleteOne({ '_id': userId });
        var promise = query.exec();
        return promise;
    }
}

module.exports = UserService;