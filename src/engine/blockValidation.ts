import type { BlockType, ProgramBlock } from './types';
import {
  isConditionAtomType,
  isCompoundConditionType,
  isConditionType,
} from './conditionBlocks';

export interface DragTargetInfo {
  containerKind: 'body' | 'conditions' | null;
  acceptOnlyAtoms?: boolean;
  acceptOnlyNonCondition?: boolean;
}

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

export function validateBlockPlacement(
  blockType: BlockType,
  target: DragTargetInfo
): ValidationResult {
  if (target.containerKind === 'conditions' || target.acceptOnlyAtoms) {
    if (!isConditionAtomType(blockType)) {
      return {
        allowed: false,
        reason: '条件区只能拖入「检测条件」原子积木，不能拖入完整条件块或其他指令',
      };
    }
    return { allowed: true };
  }

  if (target.acceptOnlyNonCondition) {
    if (isConditionType(blockType)) {
      return {
        allowed: false,
        reason: '复合条件的执行区只能放基础指令和循环，不能嵌套任何条件类积木',
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function findBlockById(
  blocks: ProgramBlock[],
  blockId: string
): ProgramBlock | null {
  for (const block of blocks) {
    if (block.id === blockId) return block;
    if (block.children) {
      const found = findBlockById(block.children, blockId);
      if (found) return found;
    }
    if (block.conditions) {
      const found = findBlockById(block.conditions, blockId);
      if (found) return found;
    }
  }
  return null;
}

export function getParentBlock(
  blocks: ProgramBlock[],
  blockId: string,
  parent: ProgramBlock | null = null
): ProgramBlock | null {
  for (const block of blocks) {
    if (block.id === blockId) return parent;
    if (block.children) {
      const found = getParentBlock(block.children, blockId, block);
      if (found) return found;
    }
    if (block.conditions) {
      const found = getParentBlock(block.conditions, blockId, block);
      if (found) return found;
    }
  }
  return null;
}

export interface NestingAnalysis {
  depth: number;
  hasConditionInCompound: boolean;
  conditionInCondition: boolean;
  compoundInCompound: boolean;
  atomInBody: boolean;
}

export function analyzeProgramStructure(blocks: ProgramBlock[]): {
  totalBlocks: number;
  maxNestingDepth: number;
  violations: Array<{ blockId: string; type: BlockType; message: string }>;
} {
  let totalBlocks = 0;
  let maxNestingDepth = 0;
  const violations: Array<{ blockId: string; type: BlockType; message: string }> = [];

  function walk(
    blocks: ProgramBlock[],
    depth: number,
    context: { inCompoundBody: boolean; inConditions: boolean }
  ) {
    for (const block of blocks) {
      totalBlocks++;
      if (depth > maxNestingDepth) maxNestingDepth = depth;

      if (context.inCompoundBody && isConditionType(block.type)) {
        violations.push({
          blockId: block.id,
          type: block.type,
          message: '复合条件的执行区内不能包含任何条件类积木',
        });
      }

      if (context.inConditions && !isConditionAtomType(block.type)) {
        violations.push({
          blockId: block.id,
          type: block.type,
          message: '复合条件的条件区只能包含条件原子积木',
        });
      }

      if (block.conditions) {
        walk(block.conditions, depth + 1, {
          inCompoundBody: false,
          inConditions: true,
        });
      }

      if (block.children) {
        const isCompound = isCompoundConditionType(block.type);
        walk(block.children, depth + 1, {
          inCompoundBody: isCompound,
          inConditions: false,
        });
      }
    }
  }

  walk(blocks, 1, { inCompoundBody: false, inConditions: false });

  return { totalBlocks, maxNestingDepth, violations };
}
