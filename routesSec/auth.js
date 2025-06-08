const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const Token = require('../models/Token');
const { auth } = require('../config/firebase');

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify and register a Firebase JWT token
 *     description: Takes a Firebase JWT token from Authentication header, verifies it, and saves it to the database
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token verification successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid token or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    message: 'Token verification successful',
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Invalidate the current token
 *     description: Removes the current token from the database
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token invalidated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token invalidated successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticateJWT, async (req, res) => {
  try {
    // Get JWT token from header
    const token = req.headers.authorization.split(' ')[1];
    
    // Delete the specific token
    await Token.deleteOne({ token });
    
    res.json({
      success: true,
      message: 'Token invalidated successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate token'
    });
  }
});

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Invalidate all tokens for the current user
 *     description: Removes all tokens for the authenticated user from the database
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All tokens invalidated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All tokens invalidated successfully (5 tokens removed)"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout-all', authenticateJWT, async (req, res) => {
  try {
    // Delete all tokens for this user
    const result = await Token.removeAllUserTokens(req.user.uid);
    
    res.json({
      success: true,
      message: `All tokens invalidated successfully (${result.deletedCount} tokens removed)`
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate tokens'
    });
  }
});

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validate user's authentication status
 *     description: Verifies if the user's token is valid and returns user info
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User is authenticated"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/validate', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    message: 'User is authenticated',
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

/**
 * @swagger
 * /auth/check-token:
 *   post:
 *     summary: Check if a token is valid
 *     description: Directly checks if a provided token is valid with Firebase (for testing)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase JWT token
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTczZWUwZTE..."
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *                 tokenInfo:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                       example: "U1234567890"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-05-10T12:00:00Z"
 *       400:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/check-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Try to verify with Firebase
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      res.json({
        success: true,
        message: 'Token is valid',
        tokenInfo: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          expiresAt: new Date(decodedToken.exp * 1000)
        }
      });
    } catch (firebaseError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: firebaseError.message
      });
    }
  } catch (error) {
    console.error('Token check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token check'
    });
  }
});

module.exports = router;