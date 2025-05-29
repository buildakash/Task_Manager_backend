const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: Object.values(err.errors).map(error => error.message)
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            error: 'This email or username is already in use.'
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token.'
        });
    }

    res.status(500).json({
        error: 'Something went wrong! Please try again later.'
    });
};

module.exports = errorHandler;