import { auth, admin } from '../config/firebase.js';
import Token from '../models/Token.js';
import dotenv from 'dotenv';
// const Token = require('../models/Token');
// const CryptoJS = require("crypto-js");
// const dotenv = require('dotenv').config()
// require('dotenv').config();


/**
 * Authentication middleware to verify JWT tokens
 * 
 * Workflow:
 * 1. Extract JWT token from Authorization header
 * 2. Check if token exists in database
 * 3. If not in database, verify with Firebase
 * 4. If valid, save to database with expiration
 * 5. Attach user info to request object
 */
const authenticateJWT = async (req, res, next) => {
  try {
    // Extract token from Authorization header

    const authHeader = req.headers.authorization;
    
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Step 1: Check if token exists in database
    const savedToken = await Token.findByTokenString(token);
    
    if (savedToken) {
      console.log('Token found in database, skipping Firebase verification');
      console.log('savedToken', savedToken);
      
      // Token exists in database, attach user info to request
        req.user = { 
          uid: savedToken.uid, 
          name: savedToken.uname,
          role: savedToken.role 
        };
      return next();
    }
    
    // Step 2: If not in database, verify with Firebase
    console.log('Token not found in database, verifying with Firebase');
    
    // extract firebase token

    // const encrypted = token
    // const decrypted = CryptoJS.AES.decrypt(process.env.PASSPHRASE, encrypted);
    // const accessToken = decrypted.toString(CryptoJS.enc.Utf8);

    try { 
      const decodedToken = await auth.verifyIdToken(token);

      
      // Step 3: Token is valid, save to database
      const expirationTime = new Date(decodedToken.exp * 1000); // Convert to milliseconds
      
      await Token.createToken(
        decodedToken.uid,
        decodedToken.name,
        decodedToken?.role || 'user',
        token,
        expirationTime
      );
       
      // Attach user info to request
      req.user = {  
        uid: decodedToken.uid, 
        name: decodedToken.name,
        role: decodedToken?.role || 'user'
      };
      
      next();
    } catch (firebaseError) {
      console.error('Token verification failed:', firebaseError);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Authentication failed.'
      });
    }
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Optional middleware to ensure user has specific role
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Middleware function
 */
const authorizeRoles = (roles = []) => {
  
  return async (req, res, next) => {
    
    try {
      // Must be used after authenticateJWT
      
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required before role authorization'
        });
      }
      
      // Get user claims from Firebase
      const userRecord = await auth.getUser(req.user.uid);
      const customClaims = userRecord.customClaims || {};
      const userRole = customClaims.role || 'user';

      console.log(userRole);
      
        
      // Check if user's role is in the allowed roles
      if (roles.length > 0 && !roles.includes(userRole)) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }
      
      // Add role to user object
      req.user.role = userRole;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error during authorization.'
      });
    }
  };
};

// module.exports = {
//   authenticateJWT,
//   authorizeRoles
// };

export {
    authenticateJWT,
    authorizeRoles  
}