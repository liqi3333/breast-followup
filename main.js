const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const createDatabaseLayer = require('./desktop-db');

let desktopDb;

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 920,
    minWidth: 1080,
    minHeight: 760,
    title: '乳腺癌随访系统',
    autoHideMenuBar: true,
    backgroundColor: '#f5f9fc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function registerIpcHandlers() {
  ipcMain.handle('desktop-db:list-users', async () => desktopDb.listUsers());
  ipcMain.handle('desktop-db:login', async (_event, payload) => desktopDb.verifyUser(payload));
  ipcMain.handle('desktop-db:register', async (_event, payload) => desktopDb.createUser(payload));
  ipcMain.handle('desktop-db:delete-user', async (_event, payload) => desktopDb.deleteUser(payload));
  ipcMain.handle('desktop-db:list-records', async () => desktopDb.listRecords());
  ipcMain.handle('desktop-db:save-record', async (_event, payload) => desktopDb.upsertRecord(payload));
  ipcMain.handle('desktop-db:delete-record', async (_event, payload) => desktopDb.deleteRecord(payload));
  ipcMain.handle('desktop-db:replace-records', async (_event, payload) => desktopDb.replaceRecords(payload));
  ipcMain.handle('desktop-db:export-backup', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择数据库备份目录',
      properties: ['openDirectory', 'createDirectory'],
    });
    if (result.canceled || !result.filePaths.length) return { canceled: true };
    return desktopDb.exportBackup(result.filePaths[0]);
  });
  ipcMain.handle('desktop-db:restore-backup', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择数据库恢复目录',
      properties: ['openDirectory'],
    });
    if (result.canceled || !result.filePaths.length) return { canceled: true };
    return desktopDb.restoreBackup(result.filePaths[0]);
  });
  ipcMain.handle('desktop-db:get-storage-info', async () => desktopDb.getStorageInfo());
}

app.whenReady().then(async () => {
  desktopDb = await createDatabaseLayer({ baseDir: path.join(app.getPath('userData'), 'data') });
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
