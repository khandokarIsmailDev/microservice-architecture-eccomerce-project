import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { createProduct,getProducts,getProductDetails, updateProduct } from './controllers'
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))


app.get('/health',(_req,res) =>{
    res.status(200).json({status:"up"})
})

//access denied middleware
// app.use((req,res,next) =>{
//     const allowedOrigins = ['http://localhost:8081','http://127.0.0.1:8081']
//     const origin = req.headers.origin || ''
//     if(allowedOrigins.includes(origin)){
//         res.setHeader('Access-Control-Allow-Origin',origin)
//         next()
//     }else{
//         res.status(403).json({message:"Access denied"})
//     }
// })

//product endpoints
app.post('/products',createProduct)
app.put('/products/:id',updateProduct)
app.get('/products',getProducts)
app.get('/products/:id',getProductDetails)
//404 handler
app.use((err:any,_req:any,res:any,_next:any) =>{
    console.error(err.stack)
    res.status(500).json({message:'internal-server-error'})
})

const port = process.env.PORT || 4001
const serviceName = process.env.SERVICE_NAME || 'product-service'


app.listen(port,() =>{
    console.log(`${serviceName} running on port ${port}`)
})