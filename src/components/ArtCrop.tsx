import type { ArtCrop as Crop } from '../game/lanternFestival.ts';

/** CSS viewport onto an unchanged historical raster; no pixels are repainted. */
export function ArtCrop({crop, label, className = ''}: {crop: Crop; label: string; className?: string}) {
  const [x, y, width, height] = crop.rect;
  return <div className={`lantern-crop ${className}`} role="img" aria-label={label} style={{aspectRatio: `${width} / ${height}`}}>
    <img src={crop.image} alt="" draggable={false} style={{width: `${crop.sourceWidth / width * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%`}}/>
  </div>;
}
