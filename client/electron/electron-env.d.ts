/// <reference types="vite-plugin-electron/electron-env" />

import { ElectronAPI } from './preload'

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

declare global {
  interface Window {
    ipcRenderer: {
      on(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): void
      off(channel: string, listener: (...args: unknown[]) => void): void
      send(channel: string, ...args: unknown[]): void
      invoke(channel: string, ...args: unknown[]): Promise<unknown>
    }
  }
}

export {}
