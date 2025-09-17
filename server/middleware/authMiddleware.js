
  export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.attendant) {
      return next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };

  export const isManager = (req, res, next) => {
    if (!req.session.attendant) {
      return res.status(401).json({ message: 'Unauthorized: Please login first' });
    }
  
    if (req.session.attendant.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden: Managers only' });
    }
  
    next();
  };