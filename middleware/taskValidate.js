const { body, param, validationResult } = require('express-validator');

const validateTask = [
    body('title')
        .trim()
        .notEmpty().withMessage('Task title is required')
        .isLength({ max: 100 }).withMessage('Task title cannot exceed 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Task description cannot exceed 1000 characters'),
    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status value'),
    body('dueDate')
        .optional()
        .isISO8601().withMessage('Invalid date format'),
];

const validateTaskId = [
    param('id')
        .isMongoId().withMessage('Invalid task ID')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => err.msg) });
    }
    next();
};

module.exports = {
    validateTask,
    validateTaskId,
    validate
};