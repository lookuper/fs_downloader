const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
var mainWindow = null;

function selectDirectory() {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    console.log('no export');
};


exports.selectDirectory = function () {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    console.log('with export');
};

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 435 * 1,
        height: 700 * 1,
        toolbar: false,
        icon: __dirname + '/buba48.ico'
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    // mainWindow.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});