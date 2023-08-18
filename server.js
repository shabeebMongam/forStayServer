require('dotenv').config()
const express = require("express")
const mongoose = require('mongoose')
const PORT = process.env.PORT || 8080
const adminRouter = require('./routes/adminRoutes.js')
const userRouter = require('./routes/userRoutes.js')
const ownerRouter = require('./routes/ownerRoutes')
const cors = require('cors')
mongoose.set('strictQuery', true)
const app = express()


app.use(cors({ credentials: true, origin: process.env.BASE_URL_FOR_CORS }))
app.use(express.json())

app.use('/', userRouter)
app.use('/admin', adminRouter)
app.use('/owner', ownerRouter)



const connectWithDB = async (url) => {
    try {
       await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log("Connected to BD");
            }).catch((error) => {
                console.log(error);
            })

    } catch (err) {
        console.log(err);
    }
}

connectWithDB(process.env.MONGO_URI).then(()=>{
    app.listen(PORT, () => { console.log(`http://localhost:${PORT}/`); })
}
)
