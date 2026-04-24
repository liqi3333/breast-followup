const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const initSqlJs = require('sql.js');

function nowIso() {
  return new Date().toISOString();
}

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, originalHash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const originalBuffer = Buffer.from(originalHash, 'hex');
  const candidateBuffer = Buffer.from(candidate, 'hex');
  return originalBuffer.length === candidateBuffer.length && crypto.timingSafeEqual(originalBuffer, candidateBuffer);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function loadDatabase(SQL, filePath, schemaSql) {
  let db;
  if (fs.existsSync(filePath)) {
    db = new SQL.Database(fs.readFileSync(filePath));
  } else {
    db = new SQL.Database();
  }
  db.exec(schemaSql);
  return db;
}

function ensureQueryHasRows(db, sql, errorMessage) {
  const result = db.exec(sql);
  if (!result.length) throw new Error(errorMessage);
  return result;
}

module.exports = async function createDatabaseLayer({ baseDir }) {
  fs.mkdirSync(baseDir, { recursive: true });
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file),
  });

  const usersPath = path.join(baseDir, 'users.db');
  const recordsPath = path.join(baseDir, 'followups.db');

  const usersSchemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;

  const recordsSchemaSql = `
    CREATE TABLE IF NOT EXISTS followup_records (
      id TEXT PRIMARY KEY,
      patient_name TEXT,
      followup_date TEXT,
      recurrence_risk TEXT,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `;

  let usersDb = await loadDatabase(SQL, usersPath, usersSchemaSql);
  let recordsDb = await loadDatabase(SQL, recordsPath, recordsSchemaSql);

  function saveUsersDb() {
    fs.writeFileSync(usersPath, Buffer.from(usersDb.export()));
  }

  function saveRecordsDb() {
    fs.writeFileSync(recordsPath, Buffer.from(recordsDb.export()));
  }

  const existingAdmin = usersDb.exec(`SELECT username FROM users WHERE username = 'admin' LIMIT 1`);
  if (!existingAdmin.length || !existingAdmin[0].values.length) {
    const stmt = usersDb.prepare(`
      INSERT INTO users (username, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const ts = nowIso();
    stmt.run(['admin', hashPassword('admin123'), 'admin', ts, ts]);
    stmt.free();
    saveUsersDb();
  }

  function listUsers() {
    const result = usersDb.exec(`SELECT username, role, created_at AS createdAt, updated_at AS updatedAt FROM users ORDER BY role DESC, username ASC`);
    if (!result.length) return [];
    const columns = result[0].columns;
    return result[0].values.map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index]])));
  }

  function verifyUser({ username, password }) {
    const stmt = usersDb.prepare(`SELECT username, password_hash, role FROM users WHERE username = ? LIMIT 1`);
    stmt.bind([username]);
    let user = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      if (verifyPassword(password, row.password_hash)) {
        user = { username: row.username, role: row.role };
      }
    }
    stmt.free();
    return user;
  }

  function createUser({ username, password }) {
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');
    if (!cleanUsername || !cleanPassword) {
      throw new Error('用户名和密码不能为空');
    }
    const existsStmt = usersDb.prepare(`SELECT username FROM users WHERE username = ? LIMIT 1`);
    existsStmt.bind([cleanUsername]);
    const exists = existsStmt.step();
    existsStmt.free();
    if (exists) throw new Error('用户名已存在');

    const stmt = usersDb.prepare(`
      INSERT INTO users (username, password_hash, role, created_at, updated_at)
      VALUES (?, ?, 'user', ?, ?)
    `);
    const ts = nowIso();
    stmt.run([cleanUsername, hashPassword(cleanPassword), ts, ts]);
    stmt.free();
    saveUsersDb();
    return { ok: true };
  }

  function deleteUser({ username }) {
    if (username === 'admin') {
      throw new Error('默认管理员账号不能删除');
    }
    const stmt = usersDb.prepare(`DELETE FROM users WHERE username = ?`);
    stmt.run([username]);
    stmt.free();
    saveUsersDb();
    return { ok: true };
  }

  function listRecords() {
    const result = recordsDb.exec(`
      SELECT payload FROM followup_records
      ORDER BY COALESCE(followup_date, '') DESC, updated_at DESC
    `);
    if (!result.length) return [];
    return result[0].values
      .map(([payload]) => safeJsonParse(payload, null))
      .filter(Boolean);
  }

  function upsertRecord(record) {
    const payload = { ...record };
    const ts = nowIso();
    const existingStmt = recordsDb.prepare(`SELECT created_at FROM followup_records WHERE id = ? LIMIT 1`);
    existingStmt.bind([payload.id]);
    let createdAt = ts;
    if (existingStmt.step()) {
      const row = existingStmt.getAsObject();
      createdAt = row.created_at || ts;
    }
    existingStmt.free();

    const stmt = recordsDb.prepare(`
      INSERT OR REPLACE INTO followup_records (id, patient_name, followup_date, recurrence_risk, payload, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      payload.id,
      payload.patientName || '',
      payload.followupDate || '',
      payload.recurrenceSign || '',
      JSON.stringify(payload),
      createdAt,
      ts,
    ]);
    stmt.free();
    saveRecordsDb();
    return payload;
  }

  function deleteRecord({ id }) {
    const stmt = recordsDb.prepare(`DELETE FROM followup_records WHERE id = ?`);
    stmt.run([id]);
    stmt.free();
    saveRecordsDb();
    return { ok: true };
  }

  function replaceRecords({ records }) {
    const items = Array.isArray(records) ? records : [];
    recordsDb.exec(`DELETE FROM followup_records;`);
    const stmt = recordsDb.prepare(`
      INSERT INTO followup_records (id, patient_name, followup_date, recurrence_risk, payload, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const record of items) {
      const ts = nowIso();
      stmt.run([
        record.id,
        record.patientName || '',
        record.followupDate || '',
        record.recurrenceSign || '',
        JSON.stringify(record),
        ts,
        ts,
      ]);
    }
    stmt.free();
    saveRecordsDb();
    return { ok: true, count: items.length };
  }

  function exportBackup(targetDir) {
    if (!targetDir) throw new Error('未选择备份目录');
    fs.mkdirSync(targetDir, { recursive: true });
    const backupDir = path.join(targetDir, `breast-followup-backup-${timestampForFile()}`);
    fs.mkdirSync(backupDir, { recursive: true });
    const usersBackup = path.join(backupDir, 'users.db');
    const recordsBackup = path.join(backupDir, 'followups.db');
    fs.copyFileSync(usersPath, usersBackup);
    fs.copyFileSync(recordsPath, recordsBackup);
    const manifest = {
      exportedAt: nowIso(),
      usersDb: path.basename(usersBackup),
      recordsDb: path.basename(recordsBackup),
      userCount: listUsers().length,
      recordCount: listRecords().length,
    };
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    return { backupDir, usersDb: usersBackup, recordsDb: recordsBackup, manifest };
  }

  async function restoreBackup(sourceDir) {
    if (!sourceDir) throw new Error('未选择恢复目录');
    const restoreUsersPath = path.join(sourceDir, 'users.db');
    const restoreRecordsPath = path.join(sourceDir, 'followups.db');
    if (!fs.existsSync(restoreUsersPath) || !fs.existsSync(restoreRecordsPath)) {
      throw new Error('恢复目录中缺少 users.db 或 followups.db');
    }

    const nextUsersDb = await loadDatabase(SQL, restoreUsersPath, usersSchemaSql);
    const nextRecordsDb = await loadDatabase(SQL, restoreRecordsPath, recordsSchemaSql);

    ensureQueryHasRows(nextUsersDb, `SELECT username, role FROM users LIMIT 1`, '用户数据库无有效数据');
    nextRecordsDb.exec(`SELECT COUNT(*) FROM followup_records`);

    const adminExists = nextUsersDb.exec(`SELECT username FROM users WHERE username = 'admin' LIMIT 1`);
    if (!adminExists.length || !adminExists[0].values.length) {
      throw new Error('恢复包中缺少 admin 管理员账号');
    }

    usersDb.close();
    recordsDb.close();
    usersDb = nextUsersDb;
    recordsDb = nextRecordsDb;
    saveUsersDb();
    saveRecordsDb();

    return {
      ok: true,
      sourceDir,
      userCount: listUsers().length,
      recordCount: listRecords().length,
    };
  }

  function getStorageInfo() {
    return {
      baseDir,
      usersDb: usersPath,
      recordsDb: recordsPath,
    };
  }

  return {
    listUsers,
    verifyUser,
    createUser,
    deleteUser,
    listRecords,
    upsertRecord,
    deleteRecord,
    replaceRecords,
    exportBackup,
    restoreBackup,
    getStorageInfo,
  };
};
