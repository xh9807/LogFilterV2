import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerFileHandlers } from './ipc/fileHandler';
import { registerFilterHandlers } from './ipc/filterHandler';
import { registerLogHandlers } from './ipc/logHandler';
import { registerExportHandlers } from './ipc/exportHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'HiLog 日志过滤器',
    backgroundColor: '#f5f5f5',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../../build/icon.png'),
  });

  // 开发环境加载Vite开发服务器，生产环境加载打包后的文件
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  // 注册IPC处理器
  registerFileHandlers();
  registerFilterHandlers();
  registerLogHandlers();
  registerExportHandlers();

  // macOS 特有处理：点击Dock图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC通信测试处理
ipcMain.handle('ping', () => {
  return 'pong';
});
