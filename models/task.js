const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [100, 'Task title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Task description cannot be more than 1000 characters']
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    dueDate: {
        type: Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

// Ensure users can only access their own tasks
taskSchema.pre('find', function() {
    if (!this._conditions.userId) {
        throw new Error('userId is required for querying tasks');
    }
});

taskSchema.pre('findOne', function() {
    if (!this._conditions.userId) {
        throw new Error('userId is required for querying tasks');
    }
});


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;