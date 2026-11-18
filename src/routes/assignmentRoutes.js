const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  getAssignmentStats,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const requireAuth = require('../middleware/requireAuth');

// All assignment routes require bearer token authentication
router.use(requireAuth);

router.route('/')
  .post(createAssignment)
  .get(getAssignments);

// Note: /stats MUST precede /:id to prevent the router from treating "stats" as an ID param
router.get('/stats', getAssignmentStats);

router.route('/:id')
  .get(getAssignmentById)
  .patch(updateAssignment)
  .delete(deleteAssignment);

module.exports = router;
