import Cropper from 'react-easy-crop'

function CropModal({
  tempImage,
  crop,
  zoom,
  cropMode,
  onCropChange,
  onCropComplete,
  onZoomChange,
  onCancel,
  onConfirm,
}) {
  const usesFullCardAspect = cropMode === 'back' || cropMode === 'frontBackground'

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
            aspect={usesFullCardAspect ? 2.48 / 3.46 : 2.48 / 1.5}
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
