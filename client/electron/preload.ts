import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

type WindowChannels =
  | 'window:maximized'
  | 'window:minimize'
  | 'window:maximize'
  | 'window:close'

type Listener<T = unknown> = (data: T) => void

// WeakMap now stores Listener<unknown>, no generic T
const listenerMap = new WeakMap<
  Listener<unknown>,
  Map<WindowChannels, (event: IpcRendererEvent, data: unknown) => void>
>()

export type ElectronAPI = {
  minimize: () => void
  maximize: () => void
  close: () => void
  on: <T>(channel: WindowChannels, listener: Listener<T>) => void
  off: <T>(channel: WindowChannels, listener: Listener<T>) => void
}

const electronAPI: ElectronAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  on: <T>(channel: WindowChannels, listener: Listener<T>) => {
    const wrapped = (_event: IpcRendererEvent, data: unknown) => {
      listener(data as T) // cast only here
    }

    // Store listener as Listener<unknown>
    let channelMap = listenerMap.get(listener as Listener<unknown>)
    if (!channelMap) {
      channelMap = new Map()
      listenerMap.set(listener as Listener<unknown>, channelMap)
    }
    channelMap.set(channel, wrapped)

    ipcRenderer.on(channel, wrapped)
  },

  off: <T>(channel: WindowChannels, listener: Listener<T>) => {
    const channelMap = listenerMap.get(listener as Listener<unknown>)
    if (!channelMap) return

    const wrapped = channelMap.get(channel)
    if (wrapped) {
      ipcRenderer.removeListener(channel, wrapped)
      channelMap.delete(channel)
    }

    if (channelMap.size === 0) listenerMap.delete(listener as Listener<unknown>)
  },
}

// Expose API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI)