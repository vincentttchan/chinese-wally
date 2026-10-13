import type {CSSProperties} from 'react';
import type {PaintingCrop} from '../game/level.ts';

/** View original pixels through a CSS window; never regenerate the person. */
export const paintingCropStyle = (crop: PaintingCrop): CSSProperties => ({
  width: `${100 / crop.width}%`, height: `${100 / crop.height}%`,
  left: `${-crop.x / crop.width * 100}%`, top: `${-crop.y / crop.height * 100}%`,
  transform: 'none',
});
