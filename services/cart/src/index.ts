import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { addToCart, getMyCart } from "./controllers";
import "./events/onKeyExpires"

dotenv.config();

const app = express();

//security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs:15 * 60 * 1000, // 15 minutes
    max:50, // Limit each IP to 50 requests per windowMs
    handler:(req,res) =>{
        res.status(429).json({message:"Too many requests from this IP, please try again in 15 minutes"})
    }
});

app.use('/api',limiter); // apply the rate limiting middleware to all requests that start with /api


// Logging middleware
app.use(morgan("dev"));
app.use(express.json());

//Todo: Auth middleware

//routes
app.post('/cart/add-to-cart',addToCart);
app.get('/cart/me',getMyCart);

//helathcheck endpoint
app.get("/health",(req,res) =>{
    res.status(200).json({message:"API Gateway is healthy"});
});

//404 error handling middleware
app.use((req,res,next) =>{
    res.status(404).json({message:"Not found"});
});

// Error handling middleware
app.use((err:any,_req:any,res:any,_next:any) =>{
    console.error(err.stack);
    res.status(500).json({message:"Internal server error"});
});

const port = process.env.CART_SERVICE || 4006;
const serviceName = process.env.SERVICE_NAME || 'Cart-Service'

app.listen(port,() =>{
    console.log(` ${serviceName} is running on port ${port}`);
});