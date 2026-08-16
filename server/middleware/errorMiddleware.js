export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 400 : (res.statusCode === 200 ? 500 : res.statusCode));
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
