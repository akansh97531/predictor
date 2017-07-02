const electron = require('electron')
var zmq = require("zmq");  
var socket = zmq.socket("rep");

// Module to control application life.
const globalShortcut = electron.globalShortcut;
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// make `process.stdin` begin emitting "keypress" events 

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 480, x:200, y:600 ,frame:true,
                   resizable:true ,alwaysOnTop:true })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.showInactive();

  mainWindow.hide();



  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)


socket.on("message", function (message) { 

      mainWindow.webContents.send("data_from_py",message.toString("utf8"));

      console.log(message.toString("utf8"));
      mainWindow.show();
      // reply(null, "selected, " + "message");
      globalShortcut.register('Left', () => {
        mainWindow.webContents.send('key' , "Left");
      });

      globalShortcut.register('Right', () => {
        mainWindow.webContents.send('key' , "Right");
      });

      globalShortcut.register('Enter', () => {
        mainWindow.webContents.send('key' , "Enter");
      });

      electron.ipcMain.on('data_selected' , (event, message) => {
        // console.log(message);
        socket.send(message);
        mainWindow.hide();
        globalShortcut.unregisterAll()
      });

    
});


socket.connect('tcp://127.0.0.1:5680');

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.