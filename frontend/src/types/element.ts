export type ElementType = 'text' | 'image' | 'rect' | 'line' | 'table' | 'icon';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  visible?: boolean;
  text?: string;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  stroke?: string;
  fill?: string;
  points?: number[];
  metadata?: Record<string, unknown>;
}
