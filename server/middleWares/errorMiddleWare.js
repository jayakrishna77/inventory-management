const errorHandler = (err, req, res, next) => {
    const statusCode = (res?.statusCode ? res?.statusCode : err?.status) || 500;
    const errorMessage = err?.message || "Somthing went wrong!";
    res
        .status(statusCode)
        .json({
            success: false,
            status: statusCode,
            message: errorMessage,
            stack: process.env.NODE_ENV === "development" ? err.stack : null
        })
}

module.exports = errorHandler