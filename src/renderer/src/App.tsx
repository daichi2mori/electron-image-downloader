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
    // if (!Array.isArray(imgUrls)) {
    //   alert('画像URLが取得されていません')
    //   return
    // }

    // for (let i = 0; i < imgUrls.length; i++) {
    //   try {
    //     const response = await fetch(imgUrls[i])
    //     const blob = await response.blob()
    //     const urlObject = window.URL.createObjectURL(blob)
    //     const a = document.createElement('a')
    //     a.href = urlObject
    //     a.download = `image-${i}.jpg`
    //     document.body.appendChild(a)
    //     a.click()
    //     document.body.removeChild(a)
    //     window.URL.revokeObjectURL(urlObject)
    //   } catch (error) {
    //     setMsg('画像の保存に失敗しました')
    //   }
    // }

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
