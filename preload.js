const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronDB', {
  listUsers: () => ipcRenderer.invoke('desktop-db:list-users'),
  login: (payload) => ipcRenderer.invoke('desktop-db:login', payload),
  register: (payload) => ipcRenderer.invoke('desktop-db:register', payload),
  deleteUser: (payload) => ipcRenderer.invoke('desktop-db:delete-user', payload),
  listRecords: () => ipcRenderer.invoke('desktop-db:list-records'),
  saveRecord: (payload) => ipcRenderer.invoke('desktop-db:save-record', payload),
  deleteRecord: (payload) => ipcRenderer.invoke('desktop-db:delete-record', payload),
  replaceRecords: (payload) => ipcRenderer.invoke('desktop-db:replace-records', payload),
  exportBackup: () => ipcRenderer.invoke('desktop-db:export-backup'),
  restoreBackup: () => ipcRenderer.invoke('desktop-db:restore-backup'),
  getStorageInfo: () => ipcRenderer.invoke('desktop-db:get-storage-info'),
});
