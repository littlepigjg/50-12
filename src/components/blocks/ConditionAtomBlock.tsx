import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ConditionDirection, ConditionTarget, ProgramBlock } from '../../engine/types';
import {
  DIRECTION_ICONS,
  DIRECTION_LABELS,
  TARGET_ICONS,
  TARGET_LABELS,
} from '../../engine/conditionBlocks';
import { BLOCK_CONFIGS } from '../../engine/blocks';
import { updateBlock } from '../../engine/blockUtils';

interface ConditionAtomBlockProps {
  block: ProgramBlock;
  isHighlighted?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (blocks: ProgramBlock[]) => void;
  allBlocks?: ProgramBlock[];
  depth?: number;
  compact?: boolean;
}

const DirectionSelector: React.FC<{
  value: ConditionDirection;
  onChange: (v: ConditionDirection) => void;
  compact?: boolean;
}> = ({ value, onChange, compact }) => {
  const directions: ConditionDirection[] = ['front', 'right', 'back', 'left'];
  return (
    <div className={`flex items-center gap-0.5 bg-white/25 rounded-md p-0.5 flex-shrink-0 ${compact ? 'scale-90' : ''}`}>
      {directions.map((dir) => (
        <button
          key={dir}
          onClick={(e) => {
            e.stopPropagation();
            onChange(dir);
          }}
          title={DIRECTION_LABELS[dir]}
          className={`
            w-6 h-6 rounded flex items-center justify-center text-sm transition-all
            ${value === dir ? 'bg-white text-gray-800 shadow font-bold' : 'text-white/90 hover:bg-white/15'}
          `}
        >
          {DIRECTION_ICONS[dir]}
        </button>
      ))}
    </div>
  );
};

const TargetSelector: React.FC<{
  value: ConditionTarget;
  onChange: (v: ConditionTarget) => void;
  compact?: boolean;
}> = ({ value, onChange, compact }) => {
  const targets: ConditionTarget[] = ['wall', 'star', 'empty', 'pit'];
  return (
    <div className={`flex items-center gap-0.5 bg-white/25 rounded-md p-0.5 flex-shrink-0 ${compact ? 'scale-90' : ''}`}>
      {targets.map((t) => (
        <button
          key={t}
          onClick={(e) => {
            e.stopPropagation();
            onChange(t);
          }}
          title={TARGET_LABELS[t]}
          className={`
            w-6 h-6 rounded flex items-center justify-center text-sm transition-all
            ${value === t ? 'bg-white text-gray-800 shadow font-bold' : 'text-white/90 hover:bg-white/15'}
          `}
        >
          {TARGET_ICONS[t]}
        </button>
      ))}
    </div>
  );
};

export const ConditionAtomBlock: React.FC<ConditionAtomBlockProps> = ({
  block,
  isHighlighted,
  onDelete,
  onUpdate,
  allBlocks = [],
  depth = 0,
  compact = false,
}) => {
  const config = BLOCK_CONFIGS[block.type];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { block, fromProgram: true, isConditionAtom: true },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 1,
    marginLeft: depth > 0 ? `${depth * 4}px` : 0,
  };

  const handleDirectionChange = (dir: ConditionDirection) => {
    if (onUpdate && allBlocks) {
      const updated = updateBlock(allBlocks, block.id, { conditionDirection: dir });
      onUpdate(updated);
    }
  };

  const handleTargetChange = (target: ConditionTarget) => {
    if (onUpdate && allBlocks) {
      const updated = updateBlock(allBlocks, block.id, { conditionTarget: target });
      onUpdate(updated);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative ${config.color} block-shadow-sm text-white rounded-md
        transition-all duration-200 my-1
        ${isHighlighted ? 'ring-4 ring-yellow-400 ring-offset-2 scale-105 z-10' : ''}
        ${isDragging ? 'rotate-2 scale-105' : ''}
      `}
    >
      <div
        className={`flex items-center gap-1.5 ${compact ? 'px-1.5 py-1 pr-7' : 'px-2 py-1.5 pr-8'} flex-wrap`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center gap-1.5 flex-1 min-w-0 flex-wrap"
        >
          <span className={`${compact ? 'text-sm' : 'text-base'} flex-shrink-0`}>
            {config.icon}
          </span>
          <DirectionSelector
            value={block.conditionDirection || 'front'}
            onChange={handleDirectionChange}
            compact={compact}
          />
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-white/90 font-semibold`}>
            有
          </span>
          <TargetSelector
            value={block.conditionTarget || 'wall'}
            onChange={handleTargetChange}
            compact={compact}
          />
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="absolute top-0.5 right-0.5 w-4.5 h-4.5 rounded-full bg-white/25 hover:bg-red-500
                     flex items-center justify-center text-[10px] transition-colors"
            title="删除条件"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ConditionAtomBlock;
