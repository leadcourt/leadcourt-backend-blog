const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const views = require('../controllers/pages');


/**
 * @route   GET /api/protected
 * @desc    Protected route example
 * @access  Private
 */
// router.get('/', authenticateJWT, (req, res) => {
//   res.json({
//     success: true,
//     message: 'This is a protected route',
//     user: {
//       uid: req.user.uid
//     }
//   });
// });

router.get('/home', authenticateJWT, (req, res) => {
  const homeResponse = views.getHomeResponse();
  res.json({
    success: true,
    data: {...homeResponse},
    user: {
      uid: req.user.uid
    }
  });
});

router.get('/profile', authenticateJWT, (req, res) => {
  const userResponse = views.getUserResponse(req.user.uid);
  res.json({
    success: true,
    data: {...userResponse},
    
  });
});

/**
 * @route   GET /api/admin
 * @desc    Admin only route example
 * @access  Admin
 */
router.get('/admin', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: {
      uid: req.user.uid,
      role: req.user.role
    }
  });
});
 




console.log('Registered routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Route: ${r.route.path}`);
  }
});


module.exports = router;