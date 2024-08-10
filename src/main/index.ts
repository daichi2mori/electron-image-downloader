import { app, shell, BrowserWindow, ipcMain, IpcMainInvokeEvent, dialog } from 'electron'
import { basename, join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { parse } from 'node-html-parser'
import { writeFile } from 'fs/promises'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // electron-vite CLIを使ったレンダラー用HMR
  // 開発用にはリモートのURLを、本番用にはローカルのhtmlファイルを読み込む
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Electronの初期化が終了し、ブラウザウィンドウを作成する準備ができたときに呼び出される。
// いくつかのAPIは、このイベントが発生した後にのみ使用できます。
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // 開発環境ではF12でDevToolsをデフォルトでオープンまたはクローズし、
  // 本番環境ではCommandOrControl + Rを無視します。
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // macOSではドックアイコンがクリックされ、他に開いているウィンドウがない場合、
    // アプリでウィンドウを再作成するのが一般的
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// macOS以外では、すべてのウィンドウを閉じたら終了する。
// macOSでは、ユーザーがCmd + Qで明示的に終了するまで、
// アプリとそのメニューバーがアクティブなままであることが一般的
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// このファイルに、アプリ固有のメイン・プロセス・コードの残りを含めることができる。
// 別のファイルにして、ここで要求することもできる。

const imgUrls: string[] = []

async function fetchImgs(event: IpcMainInvokeEvent, targetUrl: string): Promise<string[] | string> {
  const newUrl = new URL(targetUrl)
  const origin = newUrl.origin

  try {
    const response = await fetch(targetUrl)
    const htmlText = await response.text()
    const body = await parse(htmlText)
    const imgs = await body.querySelectorAll('img')
    for (const img of imgs) {
      imgUrls.push(origin + img.attributes.src)
    }
  } catch (error) {
    console.log(error)
    return 'failed'
  }

  if (imgUrls.length === 0) return 'failed'

  return imgUrls
}

async function saveImgs(): Promise<string> {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    const pathResult = await dialog.showOpenDialog(window, {
      properties: ['openDirectory'],
      defaultPath: '.'
    })

    if (pathResult.canceled) return 'cancel'

    const dest = pathResult.filePaths[0]

    for (let i = 0; i < imgUrls.length; i++) {
      try {
        const response = await fetch(imgUrls[i])
        if (!response.ok) return 'failed'
        const blob = await response.blob()
        const buffer = Buffer.from(await blob.arrayBuffer())
        const fileName = basename(imgUrls[i])
        const filePath = `${dest}/${fileName}`
        await writeFile(filePath, buffer)
      } catch (error) {
        console.log(error)
        return 'failed'
      }
    }
  }
  return 'success'
}

ipcMain.handle('fetchImgs', fetchImgs)
ipcMain.handle('saveImgs', saveImgs)
