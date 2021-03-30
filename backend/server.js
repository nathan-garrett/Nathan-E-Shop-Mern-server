const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const path = require('path');

// import routes
const productRoutes = require("./routes/productRoutes");

//app
const app = express();

//db connection

mongoose.connect(
    process.env.MONGO_URI, {
        useNewUrlParser: true, 
        useCreateIndex: true,
        useUnifiedTopology: true}
)
.then(() => console.log("DB Connected"))

mongoose.connection.on("error", err => {
    console.log(`Db connection error: ${err.message}`)
});

//middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

//routes middleware
app.use("/api", productRoutes);

// Production build 
__dirname = path.resolve()

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '/client/build')));   

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })

} else {
    app.get('/', (req, res) => {
        res.send('API online...')
    })
}

//Port the database is running on and return console log
const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});

