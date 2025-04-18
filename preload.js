import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Example: Add methods or properties to expose to the renderer process
  sendMessage: (message) => {
    console.log('Message from renderer:', message);
  }
});
