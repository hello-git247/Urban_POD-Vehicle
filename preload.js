const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    fetchData: () => ipcRenderer.send('fetch-data'),
    onData: (callback) => ipcRenderer.on('data', callback),
});