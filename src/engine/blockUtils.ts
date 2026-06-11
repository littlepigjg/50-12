import { v4 as uuidv4 } from 'uuid';
import type { BlockType, ProgramBlock } from './types';

export function createBlock(type: BlockType, extras: Partial<ProgramBlock> = {}): ProgramBlock {
  const block: ProgramBlock = {
    id: uuidv4(),
    type,
    ...extras,
  };

  if (type === 'loop') {
    block.repeatCount = extras.repeatCount || 2;
    if (!block.children) block.children = [];
  } else if (
    type === 'ifWall' ||
    type === 'ifStar' ||
    type === 'ifEmpty' ||
    type === 'ifCheck' ||
    type === 'ifAnd' ||
    type === 'ifOr' ||
    type === 'ifNot' ||
    type === 'function'
  ) {
    if (!block.children) block.children = [];
  }

  if (type === 'ifCheck' || type === 'condCheck') {
    block.conditionDirection = extras.conditionDirection || 'front';
    block.conditionTarget = extras.conditionTarget || 'wall';
  }

  if (type === 'ifAnd' || type === 'ifOr' || type === 'ifNot') {
    if (!block.conditions) block.conditions = [];
  }

  if (type === 'function') {
    block.functionId = extras.functionId || 'func1';
  }

  if (type === 'callFunction') {
    block.functionId = extras.functionId || 'func1';
  }

  return block;
}

export function cloneBlock(block: ProgramBlock): ProgramBlock {
  return {
    ...block,
    id: uuidv4(),
    children: block.children ? block.children.map(cloneBlock) : undefined,
    conditions: block.conditions ? block.conditions.map(cloneBlock) : undefined,
  };
}

export function findBlockById(
  blocks: ProgramBlock[],
  id: string
): ProgramBlock | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
    if (block.conditions) {
      const found = findBlockById(block.conditions, id);
      if (found) return found;
    }
  }
  return null;
}

export function removeBlockById(
  blocks: ProgramBlock[],
  id: string
): ProgramBlock[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => ({
      ...b,
      children: b.children ? removeBlockById(b.children, id) : undefined,
      conditions: b.conditions ? removeBlockById(b.conditions, id) : undefined,
    }));
}

export function insertBlockAfter(
  blocks: ProgramBlock[],
  targetId: string,
  newBlock: ProgramBlock
): ProgramBlock[] {
  const result: ProgramBlock[] = [];
  for (const block of blocks) {
    result.push({
      ...block,
      children: block.children
        ? insertBlockAfter(block.children, targetId, newBlock)
        : undefined,
      conditions: block.conditions
        ? insertBlockAfter(block.conditions, targetId, newBlock)
        : undefined,
    });
    if (block.id === targetId) {
      result.push(newBlock);
    }
  }
  return result;
}

export function insertBlockIntoContainer(
  blocks: ProgramBlock[],
  containerId: string,
  newBlock: ProgramBlock,
  index: number = -1
): ProgramBlock[] {
  return blocks.map((block) => {
    if (block.id === containerId) {
      if (block.children) {
        const newChildren = [...block.children];
        if (index >= 0 && index <= newChildren.length) {
          newChildren.splice(index, 0, newBlock);
        } else {
          newChildren.push(newBlock);
        }
        return { ...block, children: newChildren };
      }
      if (block.conditions) {
        const newConditions = [...block.conditions];
        if (index >= 0 && index <= newConditions.length) {
          newConditions.splice(index, 0, newBlock);
        } else {
          newConditions.push(newBlock);
        }
        return { ...block, conditions: newConditions };
      }
    }
    return {
      ...block,
      children: block.children
        ? insertBlockIntoContainer(block.children, containerId, newBlock, index)
        : undefined,
      conditions: block.conditions
        ? insertBlockIntoContainer(block.conditions, containerId, newBlock, index)
        : undefined,
    };
  });
}

export function updateBlock(
  blocks: ProgramBlock[],
  id: string,
  updates: Partial<ProgramBlock>
): ProgramBlock[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return { ...block, ...updates };
    }
    return {
      ...block,
      children: block.children ? updateBlock(block.children, id, updates) : undefined,
      conditions: block.conditions ? updateBlock(block.conditions, id, updates) : undefined,
    };
  });
}
