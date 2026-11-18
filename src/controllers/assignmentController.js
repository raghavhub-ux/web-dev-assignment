const Assignment = require('../models/Assignment');

// @desc    Create a new assignment
// @route   POST /api/v1/assignments
// @access  Private
const createAssignment = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      description,
      dueDate,
      priority,
      status,
      category,
    } = req.body;

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      dueDate,
      priority,
      status,
      category,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List assignments with filters, max 100, sorted by ascending dueDate
// @route   GET /api/v1/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.subject) {
      // Case-insensitive regex match for subject
      filter.subject = { $regex: req.query.subject, $options: 'i' };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Maximum 100 assignments, sorted by ascending due date
    const assignments = await Assignment.find(filter)
      .sort({ dueDate: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignment statistics for authenticated user
// @route   GET /api/v1/assignments/stats
// @access  Private
const getAssignmentStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assignments = await Assignment.find({ user: userId });
    const now = new Date();

    const stats = {
      total: assignments.length,
      byStatus: {
        Pending: 0,
        'In Progress': 0,
        Completed: 0,
      },
      byPriority: {
        Low: 0,
        Medium: 0,
        High: 0,
      },
      byCategory: {
        Assignment: 0,
        Lab: 0,
        Project: 0,
        Quiz: 0,
        'Exam Preparation': 0,
      },
      overdue: 0,
      upcoming: 0,
    };

    assignments.forEach((item) => {
      // Tally Status
      if (stats.byStatus[item.status] !== undefined) {
        stats.byStatus[item.status]++;
      }

      // Tally Priority
      if (stats.byPriority[item.priority] !== undefined) {
        stats.byPriority[item.priority]++;
      }

      // Tally Category
      if (stats.byCategory[item.category] !== undefined) {
        stats.byCategory[item.category]++;
      }

      // Tally Overdue vs Upcoming
      const due = new Date(item.dueDate);
      if (due < now && item.status !== 'Completed') {
        stats.overdue++;
      } else if (due >= now) {
        stats.upcoming++;
      }
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Read single assignment by ID
// @route   GET /api/v1/assignments/:id
// @access  Private
const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment by ID
// @route   PATCH /api/v1/assignments/:id
// @access  Private
const updateAssignment = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'title',
      'subject',
      'description',
      'dueDate',
      'priority',
      'status',
      'category',
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid update fields provided',
      });
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment by ID
// @route   DELETE /api/v1/assignments/:id
// @access  Private
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentStats,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};
