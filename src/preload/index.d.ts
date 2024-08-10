import { ElectronAPI } from '@electron-toolkit/preload'

export interface ImgDI {
  fetchImgs: (targetUrl: string) => Promise<string[]>
  saveImgs: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    imgDI: ImgDI
  }
}
