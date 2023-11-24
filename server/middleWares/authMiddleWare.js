const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            res.send(401);
            throw new Error("user not authorized")
        }
        const verified = jwt.verify(token, "jaya123456");
        //get user by id
        const user = await User.findById(verified.id).select("-password");
        if (!user) {
            res.send(401);
            throw new Error("user not found");
        }
        req.userVerifiedData = user;
        next();
    } catch (err) {
        next(err)
    }
}

module.exports = protect;