import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import authRoutes from './routes/auth.route.js'
import postRoutes from './routes/post.route.js'
import commentRoutes from './routes/comment.route.js'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerOptions.js';
import cors from 'cors';

import multer from 'multer';
import path from 'path';  // Use 'import' instead of 'require'

dotenv.config()






const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// // Endpoint to upload an image to Cloudinary
// app.post('/upload', upload.single('image'), (req, res) => {
//     const file = req.file;
    
//     if (!file) {
//       return res.status(400).send('No file uploaded.');
//     }
  
//     // Upload the image to Cloudinary
//     cloudinaryV2.uploader.upload_stream(
//       { resource_type: 'auto' }, // Automatically detects the file type
//       (error, result) => {
//         if (error) {
//           return res.status(500).send(error);
//         }
  
//         // Respond with the uploaded image URL
//         res.json({
//           message: 'File uploaded successfully!',
//           url: result.secure_url, // URL of the uploaded image
//         });
//       }
//     ).end(file.buffer);
//   });






// const apiRoutes = require('./routes/api');

// import path from 'path'

mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log('MongoDb is connected');
})
.catch((err)=>{
    console.log(err);
})

// const __dirname = path.resolve()


const specs = swaggerJsdoc(swaggerOptions);

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors());

// Routes
// app.use('/api', apiRoutes);

app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/post', postRoutes)
app.use('/api/comment', commentRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// app.use(express.static(path.join(__dirname, '/frontend/dist')))

// app.get('*', (req, res)=>{
//     res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'))
// })


// Your routes
// import commentRoutes from './routes/comment.route.js';
// app.use('/comments', commentRoutes);

app.listen(3000, ()=>{
    console.log('Server is running on port 3000!');
})

app.use((err, req, res, next)=>{
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})
