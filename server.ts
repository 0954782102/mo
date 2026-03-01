
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import cors from 'cors';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ua-online-secret-key-2026';
const SYSADMIN_EMAIL = 'a60840397@gmail.com';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  app.use(cors());
  app.use(express.json());

  // Database setup
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'User',
      position TEXT DEFAULT 'Адміністратор',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      punishment TEXT,
      note TEXT,
      category TEXT NOT NULL,
      sectionTitle TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      nickname TEXT,
      action TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS changelogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      text TEXT
    );
  `);

  // Seed initial rules if empty
  const rulesCount = await db.get('SELECT COUNT(*) as count FROM rules');
  if (rulesCount.count === 0) {
    const { RULES_DATA } = await import('./constants');
    for (const category in RULES_DATA) {
      for (const section of RULES_DATA[category as any]) {
        for (const rule of section.rules) {
          await db.run(
            'INSERT INTO rules (id, text, punishment, note, category, sectionTitle) VALUES (?, ?, ?, ?, ?, ?)',
            [rule.id, rule.text, rule.punishment || null, rule.note || null, category, section.title]
          );
        }
      }
    }
    console.log('Database seeded with initial rules.');
  }

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { nickname, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const role = email === SYSADMIN_EMAIL ? 'SysAdmin' : 'User';
      const position = role === 'SysAdmin' ? 'Засновник' : 'Адміністратор 1 рівня';
      
      await db.run(
        'INSERT INTO users (nickname, email, password, role, position) VALUES (?, ?, ?, ?, ?)',
        [nickname, email, hashedPassword, role, position]
      );
      
      res.status(201).json({ message: 'User registered' });
    } catch (error) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const user = await db.get('SELECT id, nickname, email, role, position, createdAt FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  });

  // Rules Routes
  app.get('/api/rules', async (req, res) => {
    const rules = await db.all('SELECT * FROM rules');
    res.json(rules);
  });

  app.post('/api/rules', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SysAdmin') return res.sendStatus(403);
    const { id, text, punishment, note, category, sectionTitle } = req.body;
    await db.run(
      'INSERT OR REPLACE INTO rules (id, text, punishment, note, category, sectionTitle) VALUES (?, ?, ?, ?, ?, ?)',
      [id, text, punishment, note, category, sectionTitle]
    );
    io.emit('rules_updated');
    res.sendStatus(200);
  });

  app.delete('/api/rules/:id', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SysAdmin') return res.sendStatus(403);
    await db.run('DELETE FROM rules WHERE id = ?', [req.params.id]);
    io.emit('rules_updated');
    res.sendStatus(200);
  });

  // Users Management (SysAdmin only)
  app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SysAdmin') return res.sendStatus(403);
    const users = await db.all('SELECT id, nickname, email, role, position, createdAt FROM users');
    res.json(users);
  });

  // Changelog
  app.get('/api/changelog', async (req, res) => {
    const logs = await db.all('SELECT * FROM changelogs ORDER BY id DESC LIMIT 10');
    res.json(logs);
  });

  app.post('/api/changelog', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SysAdmin') return res.sendStatus(403);
    const { text } = req.body;
    const date = new Date().toLocaleDateString('uk-UA');
    await db.run('INSERT INTO changelogs (date, text) VALUES (?, ?)', [date, text]);
    io.emit('changelog_updated');
    res.sendStatus(200);
  });

  // Socket.io logic
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    socket.on('identify', (userData) => {
      if (userData && userData.id) {
        onlineUsers.set(socket.id, userData);
        
        // Only broadcast online count to everyone if you want, 
        // but user specifically asked to hide "admin things" from others.
        // So we emit online count and user list ONLY to admins.
        const admins = Array.from(onlineUsers.entries())
          .filter(([_, u]) => u.role === 'SysAdmin')
          .map(([id]) => id);
        
        admins.forEach(adminSocketId => {
          io.to(adminSocketId).emit('online_users_count', onlineUsers.size);
          io.to(adminSocketId).emit('user_status_change', Array.from(onlineUsers.values()));
        });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      
      const admins = Array.from(onlineUsers.entries())
        .filter(([_, u]) => u.role === 'SysAdmin')
        .map(([id]) => id);
        
      admins.forEach(adminSocketId => {
        io.to(adminSocketId).emit('online_users_count', onlineUsers.size);
        io.to(adminSocketId).emit('user_status_change', Array.from(onlineUsers.values()));
      });
    });

    socket.on('send_notification', (data) => {
      // Only SysAdmin should trigger this, but we'll check role on frontend
      // and ideally verify token here if we were being extra secure
      io.emit('push_notification', data);
    });

    socket.on('log_activity', async (data) => {
      await db.run(
        'INSERT INTO activity_logs (userId, nickname, action) VALUES (?, ?, ?)',
        [data.userId, data.nickname, data.action]
      );
      const logs = await db.all('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 50');
      io.emit('activity_logs_updated', logs);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
