type Props = {size?: number; className?: string};

/** Each cell is hand-painted raster artwork, shared by all controls. */
function icon(cell: number) {
  return function PaintedIcon({size = 24, className = ''}: Props) {
    return <span className={`art-icon ${className}`} aria-hidden="true" style={{width: size, height: size, backgroundPosition: `${cell % 4 * 100 / 3}% ${Math.floor(cell / 4) * 100 / 3}%`}}/>;
  };
}

export const Volume2 = icon(0);
export const VolumeX = icon(1);
export const Maximize = icon(2);
export const Minimize = icon(2);
export const MoreHorizontal = icon(3);
export const BookOpen = icon(4);
export const CircleHelp = icon(5);
export const ArrowRight = icon(8);
export const ChevronDown = icon(9);
export const ChevronUp = icon(10);
export const X = icon(11);
export const RotateCcw = icon(12);
export const Check = icon(13);
export const Waves = icon(14);

export function ZoomIn({size = 24}: Props) {return <span className="art-zoom" style={{width: size, height: size}} aria-hidden="true"><Maximize size={size}/><b>＋</b></span>;}
export function ZoomOut({size = 24}: Props) {return <span className="art-zoom" style={{width: size, height: size}} aria-hidden="true"><Maximize size={size}/><b>−</b></span>;}
