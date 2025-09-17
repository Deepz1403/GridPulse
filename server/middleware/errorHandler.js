import { formatError } from '../utils/responseFormatter.js';

const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(formatError('Validation Error', errors));
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json(formatError('Invalid ID format'));
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json(formatError('Duplicate field value'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(formatError('Invalid token'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(formatError('Token expired'));
  }

  // Default error
  res.status(err.statusCode || 500).json(
    formatError(
      err.message || 'Internal Server Error',
      process.env.NODE_ENV === 'development' ? err.stack : null
    )
  );
};

export default errorHandler;
