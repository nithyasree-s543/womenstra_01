import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'womentra.db');

const db = new sqlite3.Database(DB_PATH);

// Initialize NEW table for users
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      village TEXT,
      language TEXT DEFAULT 'en',
      age INTEGER,
      gender TEXT DEFAULT 'female',
      state TEXT DEFAULT '',
      district TEXT DEFAULT '',
      literacyLevel TEXT DEFAULT 'beginner',
      interests TEXT DEFAULT '[]',
      goals TEXT DEFAULT '[]',
      streak INTEGER DEFAULT 0,
      points INTEGER DEFAULT 50,
      badges TEXT DEFAULT '["Pratham Kadam"]',
      package TEXT DEFAULT 'free',
      assignedMentorId TEXT DEFAULT 'mentor-1',
      dependentsCount INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      createdAt TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('[SQLite] Failed to create users table:', err.message);
    } else {
      console.log('[SQLite] Table "users" verified / created successfully.');
      seedDemoUser();
    }
  });
});

// Seed the demo user Sunita Devi with Demo@1234
function seedDemoUser() {
  const demoPhone = '9876543210';
  db.get('SELECT id FROM users WHERE phone = ?', [demoPhone], async (err, row) => {
    if (err) return;
    const demoPasswordHash = await bcrypt.hash('Demo@1234', 10);
    if (!row) {
      const stmt = db.prepare(`
        INSERT INTO users (
          id, phone, passwordHash, name, village, language, age, gender,
          state, district, literacyLevel, interests, goals, streak, points,
          badges, package, assignedMentorId, dependentsCount, role, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        'user-1',
        demoPhone,
        demoPasswordHash,
        'Sunita Devi',
        'Ramnagar',
        'en',
        28,
        'female',
        'Uttar Pradesh',
        'Varanasi',
        'beginner',
        JSON.stringify(['full-stack-dev', 'digital-skills-safety']),
        JSON.stringify(['Empower family', 'Learn smart phone use']),
        7,
        840,
        JSON.stringify(['Pratham Kadam', 'Digital Nari', 'Full Stack Explorer']),
        'free',
        'mentor-1',
        1,
        'user',
        new Date().toISOString()
      );
      stmt.finalize();
      console.log('[SQLite] Seeded demo user: 9876543210 (Demo@1234)');
    } else {
      // Ensure passwordHash is up-to-date for Demo@1234
      db.run('UPDATE users SET passwordHash = ? WHERE phone = ?', [demoPasswordHash, demoPhone]);
    }
  });
}

function parseUserRow(row) {
  if (!row) return null;
  return {
    ...row,
    interests: typeof row.interests === 'string' ? JSON.parse(row.interests || '[]') : (row.interests || []),
    goals: typeof row.goals === 'string' ? JSON.parse(row.goals || '[]') : (row.goals || []),
    badges: typeof row.badges === 'string' ? JSON.parse(row.badges || '[]') : (row.badges || [])
  };
}

export const userTable = {
  findByPhone: (phone) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
        if (err) reject(err);
        else resolve(parseUserRow(row));
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(parseUserRow(row));
      });
    });
  },

  insert: (user) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO users (
          id, phone, passwordHash, name, village, language, age, gender,
          state, district, literacyLevel, interests, goals, streak, points,
          badges, package, assignedMentorId, dependentsCount, role, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        user.id,
        user.phone,
        user.passwordHash,
        user.name,
        user.village || 'Gramin',
        user.language || 'en',
        user.age || null,
        user.gender || 'female',
        user.state || '',
        user.district || '',
        user.literacyLevel || 'beginner',
        JSON.stringify(user.interests || []),
        JSON.stringify(user.goals || []),
        user.streak || 0,
        user.points || 50,
        JSON.stringify(user.badges || ['Pratham Kadam']),
        user.package || 'free',
        user.assignedMentorId || 'mentor-1',
        user.dependentsCount || 0,
        user.role || 'user',
        user.createdAt || new Date().toISOString(),
        function (err) {
          if (err) reject(err);
          else resolve(user);
        }
      );
      stmt.finalize();
    });
  },

  update: (id, updates) => {
    return new Promise((resolve, reject) => {
      userTable.findById(id).then(existing => {
        if (!existing) return resolve(null);
        const merged = { ...existing, ...updates };

        db.run(`
          UPDATE users SET
            name = ?, village = ?, language = ?, age = ?, gender = ?,
            state = ?, district = ?, literacyLevel = ?, interests = ?,
            goals = ?, streak = ?, points = ?, badges = ?, package = ?,
            assignedMentorId = ?, dependentsCount = ?, role = ?
          WHERE id = ?
        `, [
          merged.name,
          merged.village,
          merged.language,
          merged.age,
          merged.gender,
          merged.state,
          merged.district,
          merged.literacyLevel,
          JSON.stringify(merged.interests || []),
          JSON.stringify(merged.goals || []),
          merged.streak,
          merged.points,
          JSON.stringify(merged.badges || []),
          merged.package,
          merged.assignedMentorId,
          merged.dependentsCount,
          merged.role,
          id
        ], function(err) {
          if (err) reject(err);
          else resolve(merged);
        });
      }).catch(reject);
    });
  }
};
