const express = require('express');
const http = require('http');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const config = require('../webpack.config');
const connectDB = require('./db');
const userRoute = require("./routes/userRoute");
const errorHandler = require('./middleWares/errorMiddleWare');

const app = express();
const port = process.env.DEV_PORT || 8080;

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const compile = webpack(config);
app.use(webpackDevMiddleware(compile, { publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compile));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/index.html'));
});

//routes middleware
app.use("/api/users", userRoute)

// error handling middleware
app.use(errorHandler);

//connecting mongodb
connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is running at port ${port}`)
    });
})
.catch(err => {
    console.log(`Server is not running at port ${port} due to ${err}`)
})


