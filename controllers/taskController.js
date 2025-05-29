const Task = require('../models/task');

const createTask = async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            userId: req.user._id
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.status) {
            match.status = req.query.status;
        }

        if (req.query.startDate || req.query.endDate) {
            match.dueDate = {};
            if (req.query.startDate) {
                match.dueDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                match.dueDate.$lte = new Date(req.query.endDate);
            }
        }
        if (req.query.search) {
            match.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        // Pagination
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ userId: req.user._id, ...match })
            .sort(sort)
            .limit(limit)
            .skip(skip);

        const total = await Task.countDocuments({ userId: req.user._id, ...match });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTask = async (req, res) => {
    const { title, description, status, dueDate } = req.body;
    const updates = { title, description, status, dueDate };
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    const isValidOperation = Object.keys(filteredUpdates).length > 0;
    console.log('Updates:', filteredUpdates); 
    console.log('Is valid operation:', isValidOperation); 
    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update task with filtered updates
        Object.keys(filteredUpdates).forEach(key => {
            task[key] = filteredUpdates[key];
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: `Failed to update task: ${error.message}` });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTaskStats = async (req, res) => {
    try {
        const stats = await Task.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    done: {
                        $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
                    },
                    todo: {
                        $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', 'done'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            total: 0,
            done: 0,
            todo: 0,
            inProgress: 0,
            overdue: 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats
};