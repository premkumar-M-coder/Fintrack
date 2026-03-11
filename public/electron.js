const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
    // Remove top menu (File / Edit / View)
    Menu.setApplicationMenu(null);

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 700,
        autoHideMenuBar: true, // extra safety
        icon: path.join(__dirname, "icon.ico"), // APP ICON
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Load React build
    win.loadFile(path.join(__dirname, "../build/index.html"));
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
