import { useState } from 'react'

function App(): JSX.Element {
  const [targetUrl, setTargetUrl] = useState('')
  const [imgUrls, setImgUrls] = useState<string[]>()
  const [msg, setMsg] = useState('')

  const handleGetImages = async (): Promise<void> => {
    const imgUrls = await window.imgDI.fetchImgs(targetUrl)
    setImgUrls(imgUrls)
  }

  const handleSaveImages = async (): Promise<void> => {
    const result = await window.imgDI.saveImgs()

    switch (result) {
      case 'success':
        setMsg('画像の保存が成功しました')
        break
      case 'cancel':
        setMsg('画像の保存がキャンセルされました')
        break
      case 'failed':
        setMsg('画像の保存に失敗しました')
    }
  }

  return (
    <>
      <label>
        Target URL:
        <input type="text" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
      </label>
      <button onClick={handleGetImages}>Get</button>
      <button onClick={handleSaveImages}>Save</button>
      <div>{msg}</div>
      <div>
        {(imgUrls?.length ?? 0) > 0 ? (
          imgUrls?.map((url, index) => <img key={index} src={url} alt={`img-${index}`} />)
        ) : (
          <p>No images found</p>
        )}
      </div>
    </>
  )
}

export default App
