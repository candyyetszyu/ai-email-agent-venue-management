import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'

// Import route handlers
import authRoutes from './routes/auth.js'
import calendarRoutes from './routes/calendar.js'
import emailRoutes from './routes/email.js'
import aiRoutes from './routes/ai.js'

// Create Hono app
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', cors({
  origin: ['https://your-domain.pages.dev', 'http://localhost:3000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

// Root route
app.get('/', (c) => {
  return c.json({ 
    message: 'AI Email Agent Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      email: '/api/email/*',
      calendar: '/api/calendar/*',
      ai: '/api/ai/*'
    }
  })
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/calendar', calendarRoutes)
app.route('/api/email', emailRoutes)
app.route('/api/ai', aiRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ message: 'Route not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  }, 500)
})

export default app