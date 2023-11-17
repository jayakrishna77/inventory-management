const mongoose = require('mongoose');

//connecting mongodb
const userName = "katikamjayakrishna143";
const password = "WNR95bNtmu8Lx0P1";
const cluster = "cluster0.8bnb6sy";
const dbName = "inventory";

const connectDB = async () => {
    try {
        const db = await mongoose.connect(
            `mongodb+srv://${userName}:${password}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        console.log(`MongoDB connected... ${db.connection.host}`);
    } catch (err) {
        throw (err)
    }
}

module.exports = connectDB;