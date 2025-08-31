import jwt from 'jsonwebtoken';

const auth = async (c, next) => {
  // Get token from header
  const token = c.req.header('Authorization')?.split(' ')[1];

  // Check if no token
  if (!token) {
    return c.json({ message: 'No token, authorization denied' }, 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to request
    c.req.user = decoded;
    await next();
  } catch (err) {
    return c.json({ message: 'Token is not valid' }, 401);
  }
};

export default auth;