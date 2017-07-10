const electron = require('electron')
var zmq = require("zmq");  
var socket = zmq.socket("pair");
var spawn = require("child_process").spawn;
const globalShortcut = electron.globalShortcut;
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

var child = spawn('python3',['script.py'],{detached: true});

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

let socket1 = socket.connect('tcp://127.0.0.1:5683');
// let socket2 = socket.connect('tcp://127.0.0.1:5682');

let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 80, x:200, y:700 ,frame:true,
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
    mainWindow = null
  })


  globalShortcut.register('CommandOrControl+Space', () => {
    socket1.close();
    child.kill();
    // socket2.close();
    process.exit();
  })

}

app.on('ready', createWindow)

socket1.on("message", function (message) { 

      console.log("here")

      var parse = JSON.parse(message.toString("utf8"));

      if (parse == "$hide" ){
        mainWindow.hide();
        globalShortcut.unregister('Left');
        globalShortcut.unregister('Right');
        globalShortcut.unregister('Enter');
        return ;
      }

      var parsed = [];

      for(var x in parse){
       parsed.push(parse[x]);
      }

      mainWindow.webContents.send("data_from_py",parsed);

      // show window but doenot focus
      mainWindow.showInactive();
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

});

electron.ipcMain.on('data_selected' , (event, message) => {
  console.log("here");
  socket1.send(message);
  mainWindow.hide();
  globalShortcut.unregister('Left');
  globalShortcut.unregister('Right');
  globalShortcut.unregister('Enter');

});


process.on('SIGINT', function() {
  socket1.close();
  child.kill();
  // socket2.close();
  process.exit();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.