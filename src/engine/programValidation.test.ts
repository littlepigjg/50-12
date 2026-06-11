import { describe, it, expect } from 'vitest';
import type { BlockType, ProgramBlock } from './types';
import {
  validateBlockPlacement,
  findBlockById,
  getParentBlock,
  analyzeProgramStructure,
  type DragTargetInfo,
  type ValidationResult,
} from './blockValidation';
import { createBlock } from './blockUtils';

describe('validateBlockPlacement - 拖放规则验证', () => {
  describe('条件区（conditions）拖放规则', () => {
    const conditionsTarget: DragTargetInfo = {
      containerKind: 'conditions',
      acceptOnlyAtoms: true,
    };

    it('条件原子 condCheck 允许拖入条件区', () => {
      const result = validateBlockPlacement('condCheck', conditionsTarget);
      expect(result.allowed).toBe(true);
    });

    it('完整条件积木 ifWall 不允许拖入条件区', () => {
      const result = validateBlockPlacement('ifWall', conditionsTarget);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('条件区只能拖入');
    });

    it('复合条件 ifAnd 不允许拖入条件区', () => {
      const result = validateBlockPlacement('ifAnd', conditionsTarget);
      expect(result.allowed).toBe(false);
    });

    it('基础指令 move 不允许拖入条件区', () => {
      const result = validateBlockPlacement('move', conditionsTarget);
      expect(result.allowed).toBe(false);
    });

    it('循环 loop 不允许拖入条件区', () => {
      const result = validateBlockPlacement('loop', conditionsTarget);
      expect(result.allowed).toBe(false);
    });

    it('所有条件类积木都被条件区拒绝', () => {
      const conditionTypes: BlockType[] = [
        'ifWall', 'ifStar', 'ifEmpty', 'ifCheck',
        'ifAnd', 'ifOr', 'ifNot',
      ];
      for (const type of conditionTypes) {
        const result = validateBlockPlacement(type, conditionsTarget);
        expect(result.allowed).toBe(false);
      }
    });
  });

  describe('复合条件执行区（acceptOnlyNonCondition）拖放规则', () => {
    const bodyTarget: DragTargetInfo = {
      containerKind: 'body',
      acceptOnlyNonCondition: true,
    };

    it('基础指令 move / turnLeft / turnRight 允许拖入', () => {
      expect(validateBlockPlacement('move', bodyTarget).allowed).toBe(true);
      expect(validateBlockPlacement('turnLeft', bodyTarget).allowed).toBe(true);
      expect(validateBlockPlacement('turnRight', bodyTarget).allowed).toBe(true);
    });

    it('循环 loop 允许拖入复合条件执行区', () => {
      expect(validateBlockPlacement('loop', bodyTarget).allowed).toBe(true);
    });

    it('函数相关 function / callFunction 允许拖入', () => {
      expect(validateBlockPlacement('function', bodyTarget).allowed).toBe(true);
      expect(validateBlockPlacement('callFunction', bodyTarget).allowed).toBe(true);
    });

    it('完整条件积木 ifWall / ifStar / ifEmpty 不允许拖入', () => {
      expect(validateBlockPlacement('ifWall', bodyTarget).allowed).toBe(false);
      expect(validateBlockPlacement('ifStar', bodyTarget).allowed).toBe(false);
      expect(validateBlockPlacement('ifEmpty', bodyTarget).allowed).toBe(false);
      expect(validateBlockPlacement('ifCheck', bodyTarget).allowed).toBe(false);
    });

    it('复合条件 ifAnd / ifOr / ifNot 不允许拖入', () => {
      expect(validateBlockPlacement('ifAnd', bodyTarget).allowed).toBe(false);
      expect(validateBlockPlacement('ifOr', bodyTarget).allowed).toBe(false);
      expect(validateBlockPlacement('ifNot', bodyTarget).allowed).toBe(false);
    });

    it('条件原子 condCheck 也不允许拖入执行区', () => {
      const result = validateBlockPlacement('condCheck', bodyTarget);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('执行区只能放基础指令');
    });

    it('所有条件类积木都被执行区拒绝', () => {
      const conditionTypes: BlockType[] = [
        'ifWall', 'ifStar', 'ifEmpty', 'ifCheck',
        'ifAnd', 'ifOr', 'ifNot', 'condCheck',
      ];
      for (const type of conditionTypes) {
        const result = validateBlockPlacement(type, bodyTarget);
        expect(result.allowed).toBe(false);
      }
    });
  });

  describe('普通执行区（无限制）拖放规则', () => {
    const normalTarget: DragTargetInfo = {
      containerKind: 'body',
    };

    it('所有类型都允许拖入普通执行区', () => {
      const allTypes: BlockType[] = [
        'move', 'turnLeft', 'turnRight', 'loop',
        'ifWall', 'ifStar', 'ifEmpty', 'ifCheck',
        'ifAnd', 'ifOr', 'ifNot', 'condCheck',
        'function', 'callFunction',
      ];
      for (const type of allTypes) {
        expect(validateBlockPlacement(type, normalTarget).allowed).toBe(true);
      }
    });
  });
});

describe('findBlockById / getParentBlock - 树结构查找', () => {
  function makeTestProgram(): ProgramBlock[] {
    const move1 = createBlock('move');
    const turn1 = createBlock('turnLeft');
    const cond1 = createBlock('condCheck');
    const cond2 = createBlock('condCheck');
    const move2 = createBlock('move');
    const turn2 = createBlock('turnRight');

    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [cond1, cond2];
    ifAndBlock.children = [move2, turn2];

    return [move1, turn1, ifAndBlock];
  }

  it('findBlockById 能找到顶层块', () => {
    const program = makeTestProgram();
    const found = findBlockById(program, program[0].id);
    expect(found).toBeDefined();
    expect(found!.type).toBe('move');
  });

  it('findBlockById 能找到复合条件内的条件原子', () => {
    const program = makeTestProgram();
    const ifAndBlock = program[2];
    const condAtom = ifAndBlock.conditions![0];
    const found = findBlockById(program, condAtom.id);
    expect(found).toBeDefined();
    expect(found!.type).toBe('condCheck');
  });

  it('findBlockById 能找到复合条件执行区内的块', () => {
    const program = makeTestProgram();
    const ifAndBlock = program[2];
    const innerMove = ifAndBlock.children![0];
    const found = findBlockById(program, innerMove.id);
    expect(found).toBeDefined();
    expect(found!.type).toBe('move');
  });

  it('findBlockById 找不到返回 null', () => {
    const program = makeTestProgram();
    const found = findBlockById(program, 'non-existent-id');
    expect(found).toBeNull();
  });

  it('getParentBlock 能找到复合条件块作为条件原子的父节点', () => {
    const program = makeTestProgram();
    const ifAndBlock = program[2];
    const condAtom = ifAndBlock.conditions![0];
    const parent = getParentBlock(program, condAtom.id);
    expect(parent).toBeDefined();
    expect(parent!.id).toBe(ifAndBlock.id);
    expect(parent!.type).toBe('ifAnd');
  });

  it('getParentBlock 能找到复合条件块作为执行区块的父节点', () => {
    const program = makeTestProgram();
    const ifAndBlock = program[2];
    const innerMove = ifAndBlock.children![0];
    const parent = getParentBlock(program, innerMove.id);
    expect(parent).toBeDefined();
    expect(parent!.id).toBe(ifAndBlock.id);
  });

  it('getParentBlock 顶层块返回 null', () => {
    const program = makeTestProgram();
    const parent = getParentBlock(program, program[0].id);
    expect(parent).toBeNull();
  });
});

describe('analyzeProgramStructure - 程序结构分析和违规检测', () => {
  it('空程序统计正确', () => {
    const result = analyzeProgramStructure([]);
    expect(result.totalBlocks).toBe(0);
    expect(result.maxNestingDepth).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  it('基础程序（无复合条件）无违规', () => {
    const program = [
      createBlock('move'),
      createBlock('turnLeft'),
      createBlock('loop', { children: [createBlock('move')] }),
    ];
    const result = analyzeProgramStructure(program);
    expect(result.totalBlocks).toBe(4);
    expect(result.maxNestingDepth).toBe(2);
    expect(result.violations).toHaveLength(0);
  });

  it('复合条件 + 条件原子 + 基础指令 → 正确程序无违规', () => {
    const cond1 = createBlock('condCheck');
    const cond2 = createBlock('condCheck');
    const move1 = createBlock('move');
    const loop1 = createBlock('loop', { children: [createBlock('turnRight')] });
    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [cond1, cond2];
    ifAndBlock.children = [move1, loop1];

    const program = [createBlock('move'), ifAndBlock];
    const result = analyzeProgramStructure(program);

    expect(result.totalBlocks).toBe(7);
    expect(result.maxNestingDepth).toBe(3);
    expect(result.violations).toHaveLength(0);
  });

  it('复合条件执行区中嵌套 ifWall → 检测为违规', () => {
    const cond1 = createBlock('condCheck');
    const ifWallBlock = createBlock('ifWall', { children: [createBlock('move')] });
    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [cond1];
    ifAndBlock.children = [ifWallBlock];

    const program = [ifAndBlock];
    const result = analyzeProgramStructure(program);

    expect(result.violations.length).toBeGreaterThan(0);
    const violation = result.violations.find((v) => v.blockId === ifWallBlock.id);
    expect(violation).toBeDefined();
    expect(violation!.message).toContain('执行区内不能包含任何条件类积木');
  });

  it('复合条件执行区中嵌套 ifAnd → 检测为违规', () => {
    const outerCond = createBlock('condCheck');
    const innerCond = createBlock('condCheck');
    const innerIfAnd = createBlock('ifAnd');
    innerIfAnd.conditions = [innerCond];
    innerIfAnd.children = [createBlock('move')];

    const outerIfAnd = createBlock('ifAnd');
    outerIfAnd.conditions = [outerCond];
    outerIfAnd.children = [innerIfAnd];

    const program = [outerIfAnd];
    const result = analyzeProgramStructure(program);

    expect(result.violations.length).toBeGreaterThan(0);
    const violation = result.violations.find((v) => v.blockId === innerIfAnd.id);
    expect(violation).toBeDefined();
    expect(violation!.type).toBe('ifAnd');
  });

  it('复合条件执行区中嵌套 condCheck → 检测为违规', () => {
    const cond1 = createBlock('condCheck');
    const misplacedAtom = createBlock('condCheck');
    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [cond1];
    ifAndBlock.children = [misplacedAtom];

    const program = [ifAndBlock];
    const result = analyzeProgramStructure(program);

    const violation = result.violations.find((v) => v.blockId === misplacedAtom.id);
    expect(violation).toBeDefined();
    expect(violation!.message).toContain('执行区内不能包含任何条件类积木');
  });

  it('复合条件条件区中拖入完整条件块 → 检测为违规', () => {
    const misplacedIfWall = createBlock('ifWall');
    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [misplacedIfWall];
    ifAndBlock.children = [createBlock('move')];

    const program = [ifAndBlock];
    const result = analyzeProgramStructure(program);

    const violation = result.violations.find((v) => v.blockId === misplacedIfWall.id);
    expect(violation).toBeDefined();
    expect(violation!.message).toContain('条件区只能包含条件原子积木');
  });

  it('复合条件条件区中拖入 move → 检测为违规', () => {
    const misplacedMove = createBlock('move');
    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [misplacedMove];
    ifAndBlock.children = [];

    const program = [ifAndBlock];
    const result = analyzeProgramStructure(program);

    const violation = result.violations.find((v) => v.blockId === misplacedMove.id);
    expect(violation).toBeDefined();
    expect(violation!.message).toContain('条件区只能包含条件原子积木');
  });

  it('复合条件条件区中拖入 ifAnd → 检测为违规', () => {
    const misplacedIfAnd = createBlock('ifAnd');
    const ifAndBlock = createBlock('ifAnd');
    ifAndBlock.conditions = [misplacedIfAnd];
    ifAndBlock.children = [];

    const program = [ifAndBlock];
    const result = analyzeProgramStructure(program);

    const violation = result.violations.find((v) => v.blockId === misplacedIfAnd.id);
    expect(violation).toBeDefined();
    expect(violation!.type).toBe('ifAnd');
  });

  it('复杂嵌套程序能正确统计最大深度', () => {
    const level3Move = createBlock('move');
    const level2Loop = createBlock('loop', { children: [level3Move] });
    const level1IfWall = createBlock('ifWall', { children: [level2Loop] });

    const program = [level1IfWall];
    const result = analyzeProgramStructure(program);

    expect(result.maxNestingDepth).toBe(3);
  });
});
