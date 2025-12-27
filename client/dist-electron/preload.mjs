"use strict";
const electron = require("electron");
const listenerMap = /* @__PURE__ */ new WeakMap();
const electronAPI = {
  minimize: () => electron.ipcRenderer.send("window:minimize"),
  maximize: () => electron.ipcRenderer.send("window:maximize"),
  close: () => electron.ipcRenderer.send("window:close"),
  on: (channel, listener) => {
    const wrapped = (_event, data) => {
      listener(data);
    };
    let channelMap = listenerMap.get(listener);
    if (!channelMap) {
      channelMap = /* @__PURE__ */ new Map();
      listenerMap.set(listener, channelMap);
    }
    channelMap.set(channel, wrapped);
    electron.ipcRenderer.on(channel, wrapped);
  },
  off: (channel, listener) => {
    const channelMap = listenerMap.get(listener);
    if (!channelMap) return;
    const wrapped = channelMap.get(channel);
    if (wrapped) {
      electron.ipcRenderer.removeListener(channel, wrapped);
      channelMap.delete(channel);
    }
    if (channelMap.size === 0) listenerMap.delete(listener);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
