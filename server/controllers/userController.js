const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require("../models/userModel");

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

        //Encrypt password before saving to DB
        var salt = await bcrypt.genSaltSync(10);
        var hashPassword = await bcrypt.hashSync(password, salt);

        // create new user
        // const user = new User(req.body)
        const user = await User.create({
            name,
            email,
            password: hashPassword
        });
        if (user) {
            const { _id, name, email, photo, phone, bio } = user;
            res
                .status(201)
                .json({
                    _id, name, email, password, photo, phone, bio
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

const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400);
            throw new Error("Please fill all the required fildes")
        }
        const findUser = await User.findOne({ email })
        if (!findUser) {
            throw new Error("user not found")
        }
        const isPasswordCorrect = await bcrypt.compare(password, findUser.password, function (err, res) {
            if (err) {
                res.status(400);
                throw new Error("Please check your password")
            }
        });
        if (isPasswordCorrect) {
            
        }
    } catch (err) {
        next(err);
    }
}

module.exports = { registerUser }