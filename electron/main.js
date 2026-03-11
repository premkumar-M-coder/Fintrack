const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: "#f3f4f6",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // 🔥 REMOVE FILE / EDIT / VIEW / HELP
    Menu.setApplicationMenu(null);

    // OPTIONAL: hide menu bar completely (Alt key won't show it)
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadFile(
        path.join(__dirname, "../build/index.html")
    );

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
