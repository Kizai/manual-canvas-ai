import { Line, Rect, Text } from 'react-konva';
import type { CanvasElement } from '../../types/element';

interface Props {
  element: CanvasElement;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<CanvasElement>) => void;
}

export function ElementRenderer({ element, selected, onSelect, onChange }: Props) {
  const common = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    draggable: !element.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (event: { target: { x: () => number; y: () => number } }) => onChange({ x: event.target.x(), y: event.target.y() }),
  };

  if (!element.visible) return null;
  if (element.type === 'text') {
    const styles = [element.fontWeight === 'bold' ? 'bold' : '', element.fontStyle === 'italic' ? 'italic' : ''].filter(Boolean).join(' ') || 'normal';
    return (
      <Text
        {...common}
        text={element.text || ''}
        fontSize={element.fontSize || 14}
        fill={element.color || '#111827'}
        fontStyle={styles}
        textDecoration={element.textDecoration}
        lineHeight={element.lineHeight || 1.4}
        align={element.align || 'left'}
        stroke={selected ? '#2563eb' : undefined}
        strokeWidth={selected ? 0.4 : 0}
      />
    );
  }
  if (element.type === 'line') {
    return <Line points={element.points || [element.x, element.y, element.x + element.width, element.y]} stroke={element.stroke || '#111827'} strokeWidth={2} draggable={!element.locked} onClick={onSelect} onDragEnd={(event) => onChange({ x: event.target.x(), y: event.target.y() })} />;
  }
  if (element.type === 'image') {
    return <Rect {...common} fill="#f8fafc" stroke={selected ? '#2563eb' : '#94a3b8'} strokeWidth={1} dash={[6, 4]} />;
  }
  return <Rect {...common} fill={element.fill || 'transparent'} stroke={selected ? '#2563eb' : (element.stroke || '#111827')} strokeWidth={selected ? 2 : 1} dash={element.type === 'table' ? [8, 4] : undefined} />;
}
