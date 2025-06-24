import express from 'express'
import { verifyToken } from '../utils/verifyUser.js'
import { createComment, deleteComment, editComment, getComments, getPostComment, likeComment } from '../controllers/comment.controller.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = express.Router()
/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     responses:
 *       200:
 *         description: List of comments
*/

// router.post('/create', verifyToken, createComment)
router.post('/create', createComment)
router.get('/getPostComments/:postId', getPostComment)
router.delete('/deleteComment/:commentId', authenticateJWT, deleteComment)
// router.put('/likeComment/:commentId', verifyToken, likeComment)
// router.put('/editComment/:commentId', verifyToken, editComment)
// router.get('/getcomments', getComments)

export default router
