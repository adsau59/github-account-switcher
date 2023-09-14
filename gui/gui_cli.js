const { app,dialog, BrowserWindow} = require("electron");
const path = require("path");
const {addAccount,deleteAccount,returnAccountList, switchAccount} = require('../lib/account-handler')
const {initialize, global_state} = require("../lib/initialize");
const {program}  = require('commander')
const {error,errorToMessage} = require("../lib/error");
const package = require('../package.json')

async function cli(){
    let error1 = await initialize()
    if (error1){
        return error1
    }
    if(!global_state.flags.parsecDataLocationFound){
        return error.PARSEC_NOT_INSTALLED
    }
    if(!global_state.flags.parsecdFound){
        return error.PARSECD_NOT_IN_DEFAULT
    }
    let opFlag;
    program
        .name('parsec-switcher-cli')
        .description('CLI to Parsec Switcher functions')
        .version(package.version);

    program.command('list')
        .description('List the existing accounts')
        .action((str, options) => {
            console.log(returnAccountList())
            opFlag = 0
        });

    program.command('add')
        .description('Add account with the given username')
        .argument('<username>','Username to add')
        .action(async (username,options)=>{
            // console.log(`Adding account ${username}`)
            opFlag = await addAccount(username)
        });

    program.command('switch')
        .description('Switch account with the given username')
        .argument('<username>','Username to add')
        .action(async (username,options)=>{
            // console.log(`Switching account ${username}`)
            opFlag = await switchAccount(username)
        });

    program.command('delete')
        .description('Delete account with the given username')
        .argument('<username>','Username to add')
        .action(async (username,options)=>{
            // console.log(`Deleting account ${username}`)
            opFlag = await deleteAccount(username)
        });

    await program.parseAsync();
    return opFlag
}

async function gui(){
    app.whenReady().then(createWindow);

    function createWindow() {
        const win = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            width: 1000,
            height: 600,
            resizable: true,
        });
        const indexPath = path.join(__dirname,'index.html')
        win.loadFile(indexPath);
        win.setMenu(null);
    }

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

}

async function main(){
  //For dev set it to 2, for prod, set to 1
  if (process.argv.length > 1) {
      let op = await cli()
      // console.log(op)
      if (op){
          console.log(errorToMessage[op])
      }
      await app.quit()

  }
  else{
      await gui()
  }
}


main()
