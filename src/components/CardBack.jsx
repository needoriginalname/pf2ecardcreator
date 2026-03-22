function CardBack({ image, alt = 'Card back', emptyLabel = 'No back image' }) {
  return (
    <div className="mtg-card mtg-card-back">
      <div className="mtg-image mtg-image-back">
        {image ? (
          <img src={image} alt={alt} />
        ) : emptyLabel ? (
          <div className="mtg-image-empty">{emptyLabel}</div>
        ) : null}
      </div>
    </div>
  )
}

export default CardBack
