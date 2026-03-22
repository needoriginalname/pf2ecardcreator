const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const maxSize = Math.max(image.naturalWidth, image.naturalHeight)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.drawImage(
    image,
    safeArea / 2 - image.naturalWidth / 2,
    safeArea / 2 - image.naturalHeight / 2
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.naturalWidth / 2 - croppedAreaPixels.x,
    0 - safeArea / 2 + image.naturalHeight / 2 - croppedAreaPixels.y
  )

  return canvas.toDataURL('image/png')
}
