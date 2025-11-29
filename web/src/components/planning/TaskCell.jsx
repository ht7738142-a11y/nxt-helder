import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { AvatarGroup } from '../Avatar';

export function DraggableTask({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task._id}`,
    data: task
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const combinedStyle = {
    ...style,
    backgroundColor: task.colorTag + '20',
    borderLeftColor: task.colorTag || '#3B82F6'
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...listeners}
      {...attributes}
      onClick={() => onEdit?.(task)}
      className="p-2 mb-2 rounded-lg shadow-sm border-l-4 cursor-move hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-900 truncate">
            {task.chantier?.name || task.chantier?.title || 'Sans nom'}
          </div>
          {task.assignedContacts && task.assignedContacts.length > 0 && (
            <div className="mt-1">
              <AvatarGroup contacts={task.assignedContacts} max={3} size="sm" />
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(task._id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition text-red-600 text-xs"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function DroppableCell({ day, chantier, children, onDrop, weather }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${day.toISOString()}-${chantier}`,
    data: { day, chantier }
  });

  const weatherIcons = {
    sunny: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rainy: '🌧️'
  };

  return (
    <div
      ref={setNodeRef}
      className={`p-2 border-l border-gray-200 min-h-[120px] transition ${
        isOver ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-blue-50'
      }`}
    >
      {/* Météo */}
      {weather && (
        <div className="text-center mb-2">
          <div className="text-xl">{weatherIcons[weather.condition]}</div>
          <div className="text-xs font-semibold text-gray-700">{weather.temp}°C</div>
          <div className="text-xs text-gray-500 truncate">
            {weather.condition === 'rainy' ? 'Pluie' : 
             weather.condition === 'sunny' ? 'Soleil' : 
             weather.condition === 'cloudy' ? 'Nuageux' : 'Variable'}
          </div>
        </div>
      )}

      {/* Tasks */}
      {children}

      {/* Icône de statut */}
      {React.Children.count(children) > 0 && (
        <div className="flex justify-center items-center py-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded flex items-center justify-center">
            <span className="text-green-600 text-xs font-bold">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
