import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ConditionDirection, ConditionTarget, ProgramBlock } from '../../engine/types';
import { BLOCK_CONFIGS, DIRECTION_ICONS, DIRECTION_LABELS, TARGET_ICONS, TARGET_LABELS } from '../../engine/blocks';
import { updateBlock } from '../../engine/blockUtils';

interface DraggableBlockProps {
  block: ProgramBlock;
  isHighlighted?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (blocks: ProgramBlock[]) => void;
  allBlocks?: ProgramBlock[];
  depth?: number;
}

const BlockChildrenContainer: React.FC<{
  containerId: string;
  containerKind?: 'body' | 'conditions';
  children?: React.ReactNode;
  color: string;
  isEmpty?: boolean;
  emptyText?: string;
}> = ({ containerId, containerKind = 'body', children, color, isEmpty, emptyText }) => {
  const dropId = containerKind === 'conditions' ? `conditions-${containerId}` : `container-${containerId}`;
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: { containerId, isContainer: true, containerKind },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[48px] m-2 p-2 rounded-lg border-2 border-dashed
        ${isOver ? 'drag-over border-blue-500' : 'border-white/40'}
        ${isEmpty ? 'flex items-center justify-center text-white/60 text-xs' : ''}
        transition-all duration-200
      `}
      style={{ backgroundColor: `${color}33` }}
    >
      {isEmpty ? <span>{emptyText || '拖入指令...'}</span> : children}
    </div>
  );
};

const DirectionSelector: React.FC<{
  value: ConditionDirection;
  onChange: (v: ConditionDirection) => void;
}> = ({ value, onChange }) => {
  const directions: ConditionDirection[] = ['front', 'right', 'back', 'left'];
  return (
    <div className="flex items-center gap-0.5 bg-white/20 rounded-md p-0.5 flex-shrink-0">
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
            ${value === dir ? 'bg-white text-gray-800 shadow' : 'text-white/80 hover:bg-white/10'}
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
}> = ({ value, onChange }) => {
  const targets: ConditionTarget[] = ['wall', 'star', 'empty', 'pit'];
  return (
    <div className="flex items-center gap-0.5 bg-white/20 rounded-md p-0.5 flex-shrink-0">
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
            ${value === t ? 'bg-white text-gray-800 shadow' : 'text-white/80 hover:bg-white/10'}
          `}
        >
          {TARGET_ICONS[t]}
        </button>
      ))}
    </div>
  );
};

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  isHighlighted,
  onDelete,
  onUpdate,
  allBlocks = [],
  depth = 0,
}) => {
  const config = BLOCK_CONFIGS[block.type];
  const [showRepeatInput, setShowRepeatInput] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { block, fromProgram: true },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 1,
    marginLeft: depth > 0 ? `${depth * 4}px` : 0,
  };

  const handleRepeatChange = (value: number) => {
    if (onUpdate && allBlocks) {
      const updated = updateBlock(allBlocks, block.id, { repeatCount: value });
      onUpdate(updated);
    }
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

  const hasChildren = config.hasChildren && block.children !== undefined;
  const hasConditions = (block.type === 'ifAnd' || block.type === 'ifOr' || block.type === 'ifNot') && block.conditions !== undefined;
  const isCompound = block.type === 'ifAnd' || block.type === 'ifOr' || block.type === 'ifNot';

  const renderChildren = (list: ProgramBlock[] | undefined) =>
    list && list.length > 0 ? (
      <div className="space-y-0">
        {list.map((child) => (
          <DraggableBlock
            key={child.id}
            block={child}
            isHighlighted={isHighlighted}
            onDelete={onDelete}
            onUpdate={onUpdate}
            allBlocks={allBlocks}
            depth={depth + 1}
          />
        ))}
      </div>
    ) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative ${config.color} block-shadow-sm text-white rounded-lg
        transition-all duration-200 my-1
        ${isHighlighted ? 'ring-4 ring-yellow-400 ring-offset-2 scale-105 z-10' : ''}
        ${isDragging ? 'rotate-2 scale-105' : ''}
      `}
    >
      <div className="flex items-center gap-2 p-2 pr-8 flex-wrap">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center gap-2 flex-1 min-w-0 flex-wrap"
        >
          <span className="text-lg flex-shrink-0">{config.icon}</span>
          <span className="text-sm font-bold truncate">{config.label}</span>

          {block.type === 'loop' && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {showRepeatInput ? (
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={block.repeatCount || 2}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    handleRepeatChange(Math.max(1, Math.min(99, v)));
                  }}
                  onBlur={() => setShowRepeatInput(false)}
                  className="w-12 text-xs bg-white/20 text-white rounded px-2 py-0.5 text-center border-none outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRepeatInput(true);
                  }}
                  className="text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30 transition-colors"
                >
                  ×{block.repeatCount || 2}
                </button>
              )}
            </div>
          )}

          {block.type === 'ifCheck' && (
            <>
              <DirectionSelector
                value={block.conditionDirection || 'front'}
                onChange={handleDirectionChange}
              />
              <span className="text-xs text-white/80">有</span>
              <TargetSelector
                value={block.conditionTarget || 'wall'}
                onChange={handleTargetChange}
              />
            </>
          )}

          {block.type === 'function' && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded flex-shrink-0">
              {block.functionId || 'func1'}
            </span>
          )}

          {block.type === 'callFunction' && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded flex-shrink-0">
              {block.functionId || 'func1'}
            </span>
          )}
        </div>

        {onDelete && depth >= 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/20 hover:bg-red-500
                     flex items-center justify-center text-xs transition-colors"
            title="删除"
          >
            ✕
          </button>
        )}
      </div>

      {isCompound && hasConditions && (
        <div className="mx-2 mb-1">
          <div className="text-xs text-white/70 px-1 mb-0.5 font-semibold">
            {block.type === 'ifNot' ? '📋 条件（一个）' : '📋 子条件'}
          </div>
          <BlockChildrenContainer
            containerId={block.id}
            containerKind="conditions"
            color={config.color.replace('bg-', '')}
            isEmpty={!block.conditions || block.conditions.length === 0}
            emptyText={block.type === 'ifNot' ? '拖入一个条件...' : '拖入条件（AND/OR）...'}
          >
            {renderChildren(block.conditions)}
          </BlockChildrenContainer>
        </div>
      )}

      {hasChildren && (
        <BlockChildrenContainer
          containerId={block.id}
          containerKind="body"
          color={config.color.replace('bg-', '')}
          isEmpty={!block.children || block.children.length === 0}
          emptyText={isCompound ? '满足则执行...' : '拖入指令...'}
        >
          {renderChildren(block.children)}
        </BlockChildrenContainer>
      )}
    </div>
  );
};

export default DraggableBlock;
