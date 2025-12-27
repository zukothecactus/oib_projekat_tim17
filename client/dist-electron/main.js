import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win = null;
const preloadPath = path.join(__dirname, "../dist-electron/preload.mjs");
function createWindow() {
  win = new BrowserWindow({
    width: 1e3,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    fullscreen: false,
    frame: false,
    backgroundColor: "#202020",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  Menu.setApplicationMenu(null);
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  win?.webContents.openDevTools();
  ipcMain.on("window:minimize", () => win?.minimize());
  ipcMain.on("window:maximize", () => {
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
    win.webContents.send("window:maximized", win.isMaximized());
  });
  ipcMain.on("window:close", () => win?.close());
  win.on("maximize", () => win?.webContents.send("window:maximized", true));
  win.on("unmaximize", () => win?.webContents.send("window:maximized", false));
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
