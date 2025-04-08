import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] 
        : ['http://localhost:5173' , 'https://algohints-1.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});
app.use("/ai", limiter);

app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DSA Hint Generator API is running",
        timestamp: new Date().toISOString()
    });
});


app.use("/ai", aiRoutes);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});


app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? "Internal server error" 
            : err.message
    });
});

export default app;