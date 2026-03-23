import Cropper from 'react-easy-crop'

function CropModal({
  tempImage,
  crop,
  zoom,
  cropMode,
  frontArtworkLayout,
  onCropChange,
  onCropComplete,
  onZoomChange,
  onCancel,
  onConfirm,
}) {
  const usesFullCardAspect = cropMode === 'back' || cropMode === 'frontBackground'
  const usesSplitFrontArtwork =
    cropMode === 'front' &&
    (frontArtworkLayout === 'art-left-text-right' || frontArtworkLayout === 'text-left-art-right')
  const cropAspect = usesFullCardAspect ? 2.48 / 3.46 : usesSplitFrontArtwork ? 1.24 / 1.5 : 2.48 / 1.5

  return (
    <div className="crop-modal">
      <div className="crop-container">
        <h3>Crop Image</h3>
        <p className="crop-hint">Drag the image to pan. Use zoom to frame the part you want.</p>
        <div className="crop-area">
          <Cropper
            image={tempImage}
            crop={crop}
            zoom={zoom}
            aspect={cropAspect}
            restrictPosition={false}
            showGrid
            onCropChange={onCropChange}
            onCropComplete={onCropComplete}
            onZoomChange={onZoomChange}
          />
        </div>
        <div className="crop-controls">
          <label>
            Zoom: {zoom.toFixed(1)}x
            <input
              type="range"
              value={zoom}
              min={0.1}
              max={5}
              step={0.01}
              onChange={(event) => onZoomChange(Number(event.target.value))}
            />
          </label>
          <div className="crop-buttons">
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" onClick={onConfirm}>
              Confirm Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CropModal
