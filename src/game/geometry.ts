export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
export type View = Point & { scale: number };
export type Limits = { min: number; max: number };
export function fitView(size: Size, image: Size): View {
  const scale = Math.min(size.width / image.width, size.height / image.height);
  return { scale, x: (size.width - image.width * scale) / 2, y: (size.height - image.height * scale) / 2 };
}
export function clampView(view: View, size: Size, image: Size): View {
  const width = image.width * view.scale;
  const height = image.height * view.scale;
  return {
    ...view,
    x: width <= size.width ? (size.width - width) / 2 : Math.min(0, Math.max(size.width - width, view.x)),
    y: height <= size.height ? (size.height - height) / 2 : Math.min(0, Math.max(size.height - height, view.y)),
  };
}
export function zoomAt(view: View, factor: number, point: Point, limits: Limits): View {
  const scale = Math.min(limits.max, Math.max(limits.min, view.scale * factor));
  const ratio = scale / view.scale;
  return { scale, x: point.x - (point.x - view.x) * ratio, y: point.y - (point.y - view.y) * ratio };
}
