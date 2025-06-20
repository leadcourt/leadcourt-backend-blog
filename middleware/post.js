import express from 'express';
import multer from 'multer';

// Multer config (in-memory for logging or Cloudinary)
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage });
 
export {
    uploadMiddleware
};