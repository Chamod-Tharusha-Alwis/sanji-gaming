import jwt from 'jsonwebtoken';

/**
 * JWT authentication middleware.
 * Extracts the token from the Authorization header (Bearer scheme),
 * verifies it against JWT_SECRET, and attaches the decoded payload to req.user.
 * Returns 401 on missing/invalid tokens.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request for downstream handlers
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default auth;
