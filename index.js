const path = require('path');
const express = require("express");
const bp = require("body-parser");
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require("mongoose");
const multer = require('multer');
const compression = require('compression');
const startScheduler = require('./config/scheduler');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();


//requiring routes
const carsroutes = require('./routes/cars')
const bookingroutes = require('./routes/bookings')
// const adminroutes = require('./routes/admin')
const authroutes = require('./routes/auth')
const userdocroutes = require('./routes/user')
// const shoproutes = require('./routes/shop')


const multerConfig = require('./config/multer');

const app = express();

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression());
app.use(bp.json());
app.use(multer({
    storage: multerConfig.fileStorage, fileFilter: multerConfig.fileFilter
}).array('images'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());

// Serve static files from the React front-end app (dist folder) 

app.use(express.static(path.join(__dirname, '../front/dist')));

// Handles any requests that don't match the ones above 

app.get('*', (req, res) => { 
    
    res.sendFile(path.join(__dirname, '../front/dist', 'index.html')); 

});

//using routes

app.use('/cars',carsroutes)
app.use('/bookings',bookingroutes)
// app.use('/admin',adminroutes)
app.use('/auth',authroutes)
app.use(userdocroutes)
// app.use('/shop',shoproutes)

mongoose.connect(process.env.MONGODB_URL).then((result) => {
    app.listen(process.env.PORT, () => {
        console.log('App listening on port', process.env.PORT);
        startScheduler();
    });
}).catch((err) => {
    console.log(err);
});