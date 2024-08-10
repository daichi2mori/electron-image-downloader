import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// コンテキスト分離が有効な場合のみ、
// `contextBridge` APIを使用してElectron APIをレンダラーに公開する。
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

contextBridge.exposeInMainWorld('imgDI', {
  async fetchImgs(targetUrl: string) {
    const result: string[] = await ipcRenderer.invoke('fetchImgs', targetUrl)
    return result
  },
  async saveImgs() {
    const result = await ipcRenderer.invoke('saveImgs')
    return result
  }
})
