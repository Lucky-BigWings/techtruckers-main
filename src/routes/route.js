const express = require('express');

const router = express.Router();

const { verifyEmail, newAdmin, generateOTP, verifyOTP, login } = require('../controllers/adminController');


// =================== admin APIS ================

router.get('/verifyEmail', verifyEmail);
router.post('/register', newAdmin);
// router.put('/createPassword/:adminId', createPassword);
router.post('/generateOTP/:adminId', generateOTP);
router.post('/verifyOTP/:adminId', verifyOTP);
router.post('/login', login);

// =================== driver APIS =================


// =================== driver APIS =================


// =================== truck APIS =================



module.exports = router;
