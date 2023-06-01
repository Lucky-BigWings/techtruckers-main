const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGen = require('otp-generator');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');
const otpModel = require('../models/otpModel');
const { isValidName, isValidEmail, isValidPhone, isValidPassword, isValidObjectId, isNumber, isString } = require('../middlewares/validator');

// ============================== email Verification ===========================

const verifyEmail = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).send({ status: false, message: "Please enter all required fields.." });
        };

        if (!isValidName(name) || !isString(name)) {
            return res.status(400).send({ status: false, message: "Invalid full_name" });
        };

        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email" });
        };

        if (!isValidPhone(phone) || !isNumber(phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone" });
        };

        const userExist = await adminModel.findOne({ $or: [{ email: email }, { phone: phone }] });

        if (userExist) {
            return res.status(400).send({ status: false, message: "user already exist" });
        };

        return res.status(200).send({ status: true, message: "Success" });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};

// ============================== Register Admin ===========================

const newAdmin = async (req, res) => {
    try {

        const data = req.body;

        const { name, email, phone, password } = data;

        if (!name || !email || !phone || !password) {
            return res.status(400).send({ status: false, message: "Please enter all required fields.." });
        };

        if (!isValidName(name) || !isString(name)) {
            return res.status(400).send({ status: false, message: "Invalid full_name" });
        };

        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email" });
        };

        if (!isValidPhone(phone) || !isNumber(phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone" });
        };

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });
        };

        // const userExist = await adminModel.findOne({ $or: [{ email: email }, { phone: phone }] });

        // if (userExist) {
        //     return res.status(400).send({ status: false, message: "user already exist" });
        // };

        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword

        const user = await adminModel.create(data);
        return res.status(201).send({ status: true, message: user });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};

// ============================== create Password ===========================

// const createPassword = async (req, res) => {
//     try {
//         const adminId = req.params.adminId;

//         if (!isValidObjectId(adminId)) {
//             return res.status(400).send({ status: false, message: "Invalid adminId" });
//         };

//         const { password } = req.body;

//         if (!password) {
//             return res.status(400).send({ status: false, message: "Please enter password" });
//         };

// if (!isValidPassword(password)) {
//     return res.status(400).send({ status: false, message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });
// };

//         const adminExist = await adminModel.findById(adminId);
//         if (adminExist) {

//             const hashedPassword = await bcrypt.hash(password, 10);

//             const updatedAdmin = await adminModel.findByIdAndUpdate(adminId, { $set: { password: hashedPassword } }, { new: true });

//             return res.status(201).send({ status: true, message: "Password created successfully" });
//         } else {
//             return res.status(404).send({ status: true, message: "admin not found" });
//         }

//     } catch (error) {
//         return res.status(500).send({ status: false, error: error.message });
//     }
// };

// ============================== generate OTP ===========================

const generateOTP = async (req, res) => {
    try {
        const adminId = req.params.adminId;
        const data = {}

        if (!isValidObjectId(adminId)) {
            return res.status(400).send({ status: false, message: "Invalid adminId" });
        };

        const adminExist = await adminModel.findById(adminId);
        if (!adminExist) {
            return res.status(404).send({ status: true, message: "user not found" });
        }

        // let otp = otpGen.generate(6, {
        //     digits: true,
        //     upperCaseAlphabets: false,
        //     lowerCaseAlphabets: false,
        //     specialChars: false,
        // });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // const mailOptions = {
        //     from: process.env.SMTP_MAIL,
        //     to: adminExist.email,
        //     subject: 'OTP Verification Code',
        //     text: `Your OTP code is ${otp}. Please enter it to verify your account.`
        // };

        // Generate a new OTP everytime ---------------

        // transporter.sendMail(mailOptions, async (error, info) => {
        //     if (error) {
        //         return res.status(500).send('Error sending OTP email');
        //     } else {
        //         const emailExist = await otpModel.findOneAndUpdate({ email: adminExist.email }, { $push: { otp: otp } }, { new: true });
        //         if (emailExist) {
        //             return res.status(201).send({ status: true, message: "OTP sent successfully..." });
        //         } else {
        //             data.email = adminExist.email;
        //             data.otp = otp;
        //             const otpGenerated = await otpModel.create(data);
        //             return res.status(201).send({ status: true, message: "OTP sent successfully..." });
        //         };
        //     };
        // });

        // Send same OTP until it is expired from db ----------------

        const emailExist = await otpModel.findOne({ email: adminExist.email });

        let otp;
        if (emailExist) {
            otp = emailExist.otp;
        } else {
            otp = otpGen.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            data.email = adminExist.email;
            data.otp = otp;
            await otpModel.create(data);
        };

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: adminExist.email,
            subject: 'OTP Verification Code',
            text: `Your OTP code is ${otp}. Please enter it to verify your account.`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return res.status(500).send('Error sending OTP email');
            } else {
                return res.status(201).send({ status: true, message: "OTP sent successfully..." });
            };
        });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};

// ============================= Verify OTP ==============================

const verifyOTP = async (req, res) => {
    try {
        const adminId = req.params.adminId;

        if (!isValidObjectId(adminId)) {
            return res.status(400).send({ status: false, message: "Invalid adminId" });
        };

        const adminExist = await adminModel.findById(adminId);
        if (!adminExist) {
            return res.status(404).send({ status: true, message: "user not found" });
        };

        let { otp } = req.body;

        if (!otp) {
            return res.status(400).send({ status: false, message: "Please enter your OTP.." });
        };

        // otp = parseInt(otp);

        const emailExist = await otpModel.findOne({ email: adminExist.email });

        if (!emailExist) {
            return res.status(400).send({ status: false, message: "Wrong OTP or OTP is expired.." });
        };

        if (otp != emailExist.otp[emailExist.otp.length - 1]) {
            return res.status(400).send({ status: false, message: "OTP is incorrect..." });
        } else {
            const userVerified = await adminModel.findByIdAndUpdate(adminId, { $set: { isVerified: true } }, { new: true });
            return res.status(400).send({ status: true, message: "Success" });
        };

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};

// ============================= Login ==============================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ status: false, message: "Please enter email & password" });
        };

        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email" });
        };

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });
        };

        const userExist = await adminModel.findOne({ email: email });

        if (userExist) {

            if (userExist.isVerified == false) {
                return res.status(400).send({ status: true, message: "You are not a verified user.. Verify your account first" });
            } else {
                const verifyPassword = await bcrypt.compare(password, userExist.password);

                if (!verifyPassword) {
                    return res.status(400).send({ status: true, message: "wrong password" });
                };

                const token = jwt.sign(
                    {
                        userId: userExist._id,
                    },
                    "my-secret-key",
                    { expiresIn: "9h" }
                );

                return res
                    .status(200)
                    .cookie('token', token, { expires: new Date(Date.now() + 86400000) })       // expires in 1 day
                    .send({ status: true, message: token });
            };
        } else {
            return res.status(404).send({ status: true, message: "user not found" });
        };
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    };
};


module.exports = { verifyEmail, newAdmin, generateOTP, verifyOTP, login };