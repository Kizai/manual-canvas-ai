import { Layer, Rect, Stage, Transformer } from 'react-konva';
import { useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { ManualPage } from '../../types/page';
import { ElementRenderer } from './ElementRenderer';
import { useEditorStore } from '../../stores/editorStore';

interface Props {
  page: ManualPage;
}

export function PageCanvas({ page }: Props) {
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const scale = useEditorStore((state) => state.scale);
  const selectElement = useEditorStore((state) => state.selectElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const stage = transformer.getStage();
    const selectedNode = stage?.findOne(`#${selectedElementId}`);
    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedElementId, page.elements_json]);

  return (
    <div className="canvas-shell">
      <Stage width={page.width * scale} height={page.height * scale} scaleX={scale} scaleY={scale}>
        <Layer>
          <Rect x={0} y={0} width={page.width} height={page.height} fill={page.background_color || '#fff'} shadowColor="rgba(15,23,42,0.18)" shadowBlur={12} shadowOffset={{ x: 0, y: 4 }} />
          {page.elements_json.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              selected={selectedElementId === element.id}
              onSelect={() => selectElement(element.id)}
              onChange={(patch) => updateElement(page.id, element.id, patch)}
            />
          ))}
          <Transformer ref={transformerRef} rotateEnabled enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} />
        </Layer>
      </Stage>
    </div>
  );
}
