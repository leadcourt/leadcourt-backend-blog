import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

import cloudinary from 'cloudinary';
import dotenv from 'dotenv'
import multer from 'multer';
import streamifier from 'streamifier';

dotenv.config();



const { v2: cloudinaryV2 } = cloudinary;  // Destructure to access cloudinary.v2


// Cloudinary configuration
cloudinaryV2.config({
  cloud_name: process.env.CLOUDI_CLOUD_NAME,
  api_key: process.env.CLOUDI_CLOUD_APIKEY,
  api_secret: process.env.CLOUDI_CLOUD_APISECRET,
});
 
export const create = async (req, res, next) => {
  if (!req.user.isAdmin || !req.user.id) {
    
    return next(errorHandler(403, "You are not allowed to create a post"));
  }

  const { title, content, category } = req.body;
  const file = req.file; 
  
  if (!file) {
    return next(errorHandler(400, "Please upload an image"));
  }

  if (!title || !content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "  -");
    
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  // console.log('base64Image', base64Image);


  // `https://res.cloudinary.com/dizrwddzs/image/upload/post/img/${file.originalname}`, {

  
  const result = await cloudinaryV2.uploader.upload(base64Image, {
        resource_type: 'image',
        folder: 'posts',
      }); 


  const newPost = new Post({
    ...req.body,
    slug,
    userId: 'LeadCourt',
    // userId: console.log(req?.user?.id) || 'LeadCourt',
    image: result.secure_url,

    // imageUrl: result.secure_url,
  });

  console.log('newPost', newPost);

  
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalPosts = await Post.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if(!req.user.isAdmin || !req.user.id){
    return next(errorHandler(403, 'You are not allowed to delete this post'))
  }
  try {
    await Post.findByIdAndDelete(req.params.postId)
    res.status(200).json('The post has been deleted')
  } catch (error) {
    next(error)
  }
}

export const updatepost = async(req, res, next)=>{
    if(!req.user.isAdmin || !req.user.id){
      return next(errorHandler(403, 'You are not allowed to update this post'))
    }
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, {
      $set: {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image,
      }
    }, {new: true})
    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}

