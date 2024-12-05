const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res,next);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Duplicate key error',
            });
        } else {
            const statusCode = error instanceof Error && error.statusCode ? error.statusCode : 500;
            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                message: error.message,
            });
        }
    }
}

export  { 
    asyncHandler 
};