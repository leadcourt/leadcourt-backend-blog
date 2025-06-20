import express from 'express'
import {verifyToken} from '../utils/verifyUser.js'
import { create, deletepost, getposts, updatepost } from '../controllers/post.controller.js'
// const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
import {authenticateJWT} from '../middleware/auth.js'
import { uploadMiddleware } from '../middleware/post.js'

const router = express.Router()

// router.post('/create', verifyToken, create)
// router.put('/updatepost/:postId/:userId', verifyToken, updatepost)

router.post('/create', uploadMiddleware.single('image'), create)
router.get('/getposts', getposts)
router.delete('/deletepost/:postId/:userId', authenticateJWT, deletepost)
router.put('/updatepost/:postId', authenticateJWT, updatepost)



export default router