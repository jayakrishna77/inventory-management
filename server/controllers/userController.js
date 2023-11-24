const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, "jaya123456", { expiresIn: "1d" })
}
// register funciton
const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please fill all the required fildes")
        } else if (password.length < 5) {
            res.status(400);
            throw new Error("Password must be more then 5 characters")
        }
        // checking user
        if (userExists) {
            res.status(400);
            throw new Error("Email is already been registered please enter a valid email id")
        }

        // create new user
        // const user = new User(req.body)
        const user = await User.create({
            name,
            email,
            password
        });

        //genetrating token
        const token = generateToken(user._id);

        //send HTTP-only cookie
        res.cookie("access_token", token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1day
            sameSite: 'none',
            secure: true
        })

        if (user) {
            const { _id, name, email, photo, phone, bio } = user;
            res
                .status(201)
                .json({
                    _id, name, email, photo, phone, bio, token
                })
                .send("user has been created")
        } else {
            res.status(400)
            throw new Error("Invalid user data")
        }
    } catch (err) {
        next(err)
    }
}
// login function
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400);
            throw new Error("Please fill all the required fildes")
        }
        const findUser = await User.findOne({ email })
        if (!findUser) {
            res.status(400);
            throw new Error("user not found")
        }
        const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
        //genetrating token
        const token = generateToken(findUser._id);

        res.cookie("access_token", token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1day
            sameSite: 'none',
            secure: true
        })

        if (isPasswordCorrect && findUser) {
            const { _id, name, email, photo, phone, bio } = findUser;
            res
                .status(200)
                .json({
                    _id, name, email, photo, phone, bio, token
                })
        } else {
            res.status(400);
            throw new Error("you have entered invalid email or password")
        }
    } catch (err) {
        next(err);
    }
}

// logout function
const logoutUser = async (req, res, next) => {
    res.cookie("access_token", "", {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true
    });
    res.status(200).json({ message: "successfully loggedout" })
}

// get user data
const getUser = async (req, res, next) => {
    res.status(200).json(req.userVerifiedData)
}

const loggedIn = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.json(false)
    }
    // verify token
    const verified = jwt.verify(token, "jaya123456");
    if (verified) {
        return res.json(true)
    }
    return res.json(false);
}

// update user by id
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userVerifiedData._id);
        if (user) {
            const { name, email, photo, phone, bio } = user;
            user.email = email;
            user.name = req.body.name || name;
            user.photo = req.body.photo || photo;
            user.phone = req.body.phone || phone;
            user.bio = req.body.bio || bio;

            const updatedUser = await user.save()

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                photo: updatedUser.photo,
                phone: updatedUser.phone,
                bio: updatedUser.bio
            })
        }
    } catch (err) {
        next(err)
    }

}

// change user password
const changePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.userVerifiedData._id);
        const { oldpassword, newpassword } = req.body;
        const isPasswordCorrect = await bcrypt.compare(oldpassword, user.password)
        if (!user) {
            res.status(401);
            throw new Error("user not found")
        }
        if (user && isPasswordCorrect) {
            user.password = newpassword;
            await user.save();
            res.status(200).send("Password changed successfully")
        } else {
            res.status(400);
            throw new Error("Old password is incorrect ")
        }
    } catch (err) {
        next(err)
    }
}

// forgot password
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error("user not found")
    }

    // Delete token if it exists in DB
    let existingToken = await Token.findOne({ userId: user._id });
    if (existingToken) {
        await existingToken.deleteOne()
    }

    //create reste token
    const resetToken = crypto.randomBytes(32).toString("hex") + user._id

    //hash token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest("hex");

    // save token in db
    const tokenData = {
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiredAt: Date.now() + 30 * (60 * 1000) // thirty minutes  
    }
    const token = new Token(tokenData);

    try {
        await token.save();
        // const savedToken = await token.save();
        // res.status(200).json(savedToken)
    } catch (err) {
        next(err);
    }

    // Construct Reset URL
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`

    // Reset Email
    const message = `
    <h2>Hello ${user.name} </h2>
    <p>Please use the below url to  reset the password</p>
    <p>This reset link is valid for only 30min.</p>
    <a href=${resetUrl} clicktracking=off >${resetUrl}</a>

    <p>Regards...</p>
    <p>Jaya</p>
    `;

    const subject = "Password Reset Request";
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER

    res.send(`${message}, ${send_from}, ${send_to}, ${subject}`)

    // try {
    //     await sendEmail(send_from, send_to, subject, message);
    //     res.status(200).json({
    //         success: true,
    //         message: "Reset Email sent"
    //     })
    // } catch (err) {
    //     res.status(500)
    //     throw new Error("Email not sent, please try again")
    // }
}

// reset password
const resetPassword = async (req, res, next) => {
    try {

        const { password } = req.body;
        const { resetToken } = req.params;

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest("hex");

        // the token in DB
        const userToken = await Token.findOne({
            token: hashedToken,
            expiredAt: { $gt: Date.now() }
        });

        if (!userToken) {
            res.status(500)
            throw new Error("Invalid or expired token")
        }

        //Find user
        const user = await User.findOne({ _id: userToken.userId });
        user.password = password;
        await user.save();
        res.status(200).json({ message: "Password Reset Successful" });

    } catch (err) {
        next(err)
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    loggedIn,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}