const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('uiBuilder', {
  selectProject: () => ipcRenderer.invoke('project:select'),
  scanProject: (projectPath, fullRescan = false) =>
    ipcRenderer.invoke('project:scan', { projectPath, fullRescan }),
  readSnippet: (filePath, line) =>
    ipcRenderer.invoke('project:snippet', { filePath, line }),
  exportReport: (projectPath, data) =>
    ipcRenderer.invoke('project:export-report', { projectPath, data }),
  buildPreview: (options) => ipcRenderer.invoke('preview:build', options),
  buildThumbnail: (options) => ipcRenderer.invoke('thumbnail:build', options),
  writeGenerated: (projectPath, screenName, source) =>
    ipcRenderer.invoke('builder:write', { projectPath, screenName, source }),
  getVersion: () => ipcRenderer.invoke('app:version'),
});
