const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route.js");
const dotenv = require('dotenv');
const cors = require("cors")
dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/', route);

app.use((req, res) => {
    return res.status(404).send({ status: false, message: "Incorrect URL! Please enter valid URL" });
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        console.log("Database connected");
        app.listen(PORT, () => {
            console.log(`App running on ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
