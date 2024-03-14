const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dbname ="mini-project";
mongoose.connect(`mongodb://127.0.0.1:27017/${dbname}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('connected to the database')
})

const routes = require('./routes/routes');
const { db } = require('./models/user');

app = express()

app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}))

app.use(express.json())

app.use('/api', routes)
app.use(express.static(__dirname + '/uploads'));
app.listen(8000)
