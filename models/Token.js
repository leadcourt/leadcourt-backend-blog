// const mongoose = require('mongoose');
import mongoose from 'mongoose';

/**
 * Token Schema
 * Stores valid JWT tokens with automatic expiration
 */
const TokenSchema = new mongoose.Schema({
  // Firebase user ID
  uid: {
    type: String,
    required: true,
    index: true
  },
  
  // JWT token (the actual token string)
  token: {
    type: String,
    required: true,
    unique: true
  },
  
  // Token expiration date (used for automatic cleanup)
  expiresAt: {
    type: Date,
    required: true,
    // index: true
  },
  
  // When the token was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create TTL index for automatic token deletion when expired
// The expireAfterSeconds: 0 means documents will expire when the current date is >= expiresAt
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Find a token by its string value
 * @param {string} tokenStr - The JWT token string
 * @returns {Promise} - Token document or null
 */
TokenSchema.statics.findByTokenString = function(tokenStr) {
  return this.findOne({ token: tokenStr });
};

/**
 * Create a new token record
 * @param {string} uid - Firebase user ID
 * @param {string} token - JWT token string
 * @param {Date} expiresAt - Token expiration date
 * @returns {Promise} - The created token document
 */
TokenSchema.statics.createToken = function(uid, token, expiresAt) {
  return this.create({
    uid,
    token,
    expiresAt
  });
};

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


/**
 * Remove all tokens for a specific user
 * @param {string} uid - Firebase user ID
 * @returns {Promise} - The deletion result
 */
TokenSchema.statics.removeAllUserTokens = function(uid) {
  return this.deleteMany({ uid });
};

// Create and export the model
const Token = mongoose.model('Token', TokenSchema);

// module.exports = Token;
export default {
  Token
}