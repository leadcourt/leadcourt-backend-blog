/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/', (req, res) => {
    res.json([{ id: 1, content: 'First comment' }]);
  });
  