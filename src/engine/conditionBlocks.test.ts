import { describe, it, expect } from 'vitest';
import type { BlockType, ConditionTarget, Direction } from './types';
import {
  isConditionAtomType,
  isCompoundConditionType,
  isConditionType,
  isControlFlowType,
  CONDITION_ATOM_CONFIGS,
  CONDITION_BLOCK_CONFIGS,
  TARGET_LABELS,
  TARGET_ICONS,
  DIRECTION_LABELS,
  DIRECTION_ICONS,
} from './conditionBlocks';

describe('isConditionAtomType', () => {
  it('condCheck 是条件原子', () => {
    expect(isConditionAtomType('condCheck')).toBe(true);
  });

  it('非 condCheck 不是条件原子', () => {
    const nonAtomTypes: BlockType[] = [
      'move', 'turnLeft', 'turnRight', 'loop',
      'ifWall', 'ifStar', 'ifEmpty', 'ifCheck',
      'ifAnd', 'ifOr', 'ifNot',
      'function', 'callFunction',
    ];
    for (const type of nonAtomTypes) {
      expect(isConditionAtomType(type)).toBe(false);
    }
  });
});

describe('isCompoundConditionType', () => {
  it('ifAnd / ifOr / ifNot 是复合条件', () => {
    expect(isCompoundConditionType('ifAnd')).toBe(true);
    expect(isCompoundConditionType('ifOr')).toBe(true);
    expect(isCompoundConditionType('ifNot')).toBe(true);
  });

  it('其他类型不是复合条件', () => {
    const nonCompoundTypes: BlockType[] = [
      'move', 'turnLeft', 'turnRight', 'loop',
      'ifWall', 'ifStar', 'ifEmpty', 'ifCheck', 'condCheck',
      'function', 'callFunction',
    ];
    for (const type of nonCompoundTypes) {
      expect(isCompoundConditionType(type)).toBe(false);
    }
  });
});

describe('isConditionType - 判断任何条件相关类型', () => {
  it('所有条件类积木返回 true', () => {
    const conditionTypes: BlockType[] = [
      'ifWall', 'ifStar', 'ifEmpty', 'ifCheck',
      'ifAnd', 'ifOr', 'ifNot', 'condCheck',
    ];
    for (const type of conditionTypes) {
      expect(isConditionType(type)).toBe(true);
    }
  });

  it('非条件类积木返回 false', () => {
    const nonConditionTypes: BlockType[] = [
      'move', 'turnLeft', 'turnRight', 'loop',
      'function', 'callFunction',
    ];
    for (const type of nonConditionTypes) {
      expect(isConditionType(type)).toBe(false);
    }
  });
});

describe('isControlFlowType - 判断控制流类型', () => {
  it('loop + 所有条件积木返回 true', () => {
    const controlFlowTypes: BlockType[] = [
      'loop',
      'ifWall', 'ifStar', 'ifEmpty', 'ifCheck',
      'ifAnd', 'ifOr', 'ifNot',
    ];
    for (const type of controlFlowTypes) {
      expect(isControlFlowType(type)).toBe(true);
    }
  });

  it('基础指令/条件原子/函数返回 false', () => {
    const nonControlFlowTypes: BlockType[] = [
      'move', 'turnLeft', 'turnRight',
      'condCheck',
      'function', 'callFunction',
    ];
    for (const type of nonControlFlowTypes) {
      expect(isControlFlowType(type)).toBe(false);
    }
  });
});

describe('CONDITION_ATOM_CONFIGS - 条件原子配置', () => {
  it('condCheck 配置存在且正确标记 isConditionAtom', () => {
    const cfg = CONDITION_ATOM_CONFIGS.condCheck;
    expect(cfg).toBeDefined();
    expect(cfg.type).toBe('condCheck');
    expect(cfg.isConditionAtom).toBe(true);
    expect(cfg.category).toBe('condition-atom');
    expect(cfg.color).toBe('bg-block-atom');
  });
});

describe('CONDITION_BLOCK_CONFIGS - 条件块配置', () => {
  it('完整条件积木不带 isConditionAtom 标记', () => {
    for (const key of ['ifWall', 'ifStar', 'ifEmpty', 'ifCheck', 'ifAnd', 'ifOr', 'ifNot'] as BlockType[]) {
      const cfg = CONDITION_BLOCK_CONFIGS[key];
      expect(cfg).toBeDefined();
      expect((cfg as any).isConditionAtom).not.toBe(true);
    }
  });

  it('复合条件积木 hasConditionBody 为 true', () => {
    expect(CONDITION_BLOCK_CONFIGS.ifAnd.hasConditionBody).toBe(true);
    expect(CONDITION_BLOCK_CONFIGS.ifOr.hasConditionBody).toBe(true);
    expect(CONDITION_BLOCK_CONFIGS.ifNot.hasConditionBody).toBe(true);
  });
});

describe('DIRECTION_LABELS / DIRECTION_ICONS - 方向常量', () => {
  it('四个方向都有定义', () => {
    const dirs: Direction[] = ['front', 'back', 'left', 'right'];
    for (const d of dirs) {
      expect(DIRECTION_LABELS[d]).toBeDefined();
      expect(DIRECTION_ICONS[d]).toBeDefined();
      expect(typeof DIRECTION_LABELS[d]).toBe('string');
      expect(typeof DIRECTION_ICONS[d]).toBe('string');
    }
    expect(DIRECTION_ICONS.front).toBe('⬆️');
    expect(DIRECTION_ICONS.back).toBe('⬇️');
    expect(DIRECTION_ICONS.left).toBe('⬅️');
    expect(DIRECTION_ICONS.right).toBe('➡️');
  });
});

describe('TARGET_LABELS / TARGET_ICONS - 目标常量', () => {
  it('四个目标都有定义', () => {
    const targets: ConditionTarget[] = ['wall', 'star', 'empty', 'pit'];
    for (const t of targets) {
      expect(TARGET_LABELS[t]).toBeDefined();
      expect(TARGET_ICONS[t]).toBeDefined();
      expect(typeof TARGET_LABELS[t]).toBe('string');
      expect(typeof TARGET_ICONS[t]).toBe('string');
    }
    expect(TARGET_ICONS.wall).toBe('🧱');
    expect(TARGET_ICONS.star).toBe('⭐');
    expect(TARGET_ICONS.empty).toBe('⬜');
    expect(TARGET_ICONS.pit).toBe('🕳️');
  });
});
