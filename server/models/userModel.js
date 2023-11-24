const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add a email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter validi eamil address"
        ]
    },
    password: {
        type: String,
        required: [true, "Please add a Password"],
        minLength: [5, "Password must be up to 5 characters"],
        // maxLength: [20, "Password not more then 20 characters"]
    },
    photo: {
        type: String,
        required: [true, "Please add a Photo"],
        default: "https://i.ibb.co/4pDNDK1/avatar.png"
    },
    phone: {
        type: String,
        default: "+91"
    },
    bio: {
        type: String,
        maxLength: [250, "Bio not more then 250 characters"],
        default: "Bio of user"
    }
}, { timestamps: true });

UserSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();

    const user = this;
    //Encrypt password before saving to DB
    var salt = await bcrypt.genSaltSync(10);
    var hashPassword = await bcrypt.hashSync(user.password, salt);

    user.password = hashPassword;
    next();
})

module.exports = mongoose.model("User", UserSchema);