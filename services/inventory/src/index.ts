import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))


app.get('/health',(req,res) =>{
    res.status(200).json({status:"up"})
})


//404 handler
app.use((err,req,res,next) =>{
    console.error(err.stack)
    res.status(500).json({message:'internal-server-error'})
})

const port = process.env.PORT || 4002
const serviceName = process.env.SERVICE_NAME || 'inventory-service'


app.listen(port,() =>{
    console.log(`${serviceName} running on port ${port}`)
})