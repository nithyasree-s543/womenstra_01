import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'womentra_secure_dev_jwt_secret_2026';

/**
 * Express middleware: verifies the JWT from the Authorization header OR httpOnly cookie.
 * Attaches decoded { id, phone, role } to req.user.
 */
export const requireAuth = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check httpOnly cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, phone, role }
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid. Please login again.'
    });
  }
};

