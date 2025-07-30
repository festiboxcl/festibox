import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import type { UploadedImage } from '../types';

interface SortableItemProps {
  id: string;
  image: UploadedImage;
  onRemove: (id: string) => void;
}

export function SortableItem({ id, image, onRemove }: SortableItemProps) {
  console.log('SortableItem recibió imagen:', image);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-colors">
        <img
          src={image.preview}
          alt={`Foto ${image.position}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay con controles */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            {/* Botón de arrastrar */}
            <button
              {...attributes}
              {...listeners}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              title="Arrastrar para reordenar"
            >
              <GripVertical className="h-4 w-4 text-gray-600" />
            </button>
            
            {/* Botón de eliminar */}
            <button
              onClick={() => onRemove(id)}
              className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
              title="Eliminar foto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Número de posición */}
      <div className="absolute -top-2 -left-2 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
        {image.position}
      </div>
    </div>
  );
}
