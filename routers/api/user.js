// Import the express and config the router
const express = require('express');
const router = express.Router();

// Import the controller middleware
const userController = require('../../controller/UserController');

// Import multer to handle file request
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Authentication middleware
const auth = require('../../middleware/auth');

// Register
router.post('/register', userController.user_register);

// Login
router.post('/login', userController.user_login);

// Access profile (need authentication)
router.get('/profile', auth, userController.access_profile);

// Update profile (need authentication)
router.put('/profile', auth, upload.single('profileImage'), userController.update_profile);

// Change password
router.put('/security', auth, userController.change_password);

// Check the jwt from client
router.get('/auth', auth, userController.auth_check);

// TODO: clear the code segment when release
router.get('/test', (req, res) => {
    return res.status(200).json({
        foo: 'bar',
    });
});

// Exports router
module.exports = router;