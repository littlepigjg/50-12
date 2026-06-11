import type {
  BlockConfig,
  BlockType,
  ConditionDirection,
  ConditionTarget,
} from './types';

export const DIRECTION_LABELS: Record<ConditionDirection, string> = {
  front: '前方',
  back: '后方',
  left: '左方',
  right: '右方',
};

export const DIRECTION_ICONS: Record<ConditionDirection, string> = {
  front: '⬆️',
  back: '⬇️',
  left: '⬅️',
  right: '➡️',
};

export const TARGET_LABELS: Record<ConditionTarget, string> = {
  wall: '墙',
  star: '星星',
  empty: '可通行',
  pit: '陷阱',
};

export const TARGET_ICONS: Record<ConditionTarget, string> = {
  wall: '🧱',
  star: '⭐',
  empty: '⬜',
  pit: '🕳️',
};

export const CONDITION_ATOM_CONFIGS: Record<string, BlockConfig> = {
  condCheck: {
    type: 'condCheck',
    label: '检测条件',
    color: 'bg-block-atom',
    icon: '🔍',
    description: '纯检测项：检查指定方向的目标，不执行指令。用于并且/或者/否则的条件组合。',
    category: 'condition-atom',
    isConditionAtom: true,
  },
};

export const CONDITION_BLOCK_CONFIGS: Record<string, BlockConfig> = {
  ifWall: {
    type: 'ifWall',
    label: '如果前方是墙',
    color: 'bg-block-condition',
    icon: '🧱',
    description: '如果前方有墙壁，则执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifStar: {
    type: 'ifStar',
    label: '如果前方有星星',
    color: 'bg-block-condition',
    icon: '⭐',
    description: '如果前方有星星，则执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifEmpty: {
    type: 'ifEmpty',
    label: '如果前方是空',
    color: 'bg-block-condition',
    icon: '⬜',
    description: '如果前方可以通行，则执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifCheck: {
    type: 'ifCheck',
    label: '如果...则执行',
    color: 'bg-block-condition',
    icon: '🔍',
    description: '可自由配置方向和目标，条件满足则执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifAnd: {
    type: 'ifAnd',
    label: '并且 (全部满足)',
    color: 'bg-block-compound-and',
    icon: '🔗',
    description: '所有子条件都满足时，才执行内部指令。拖入"检测条件"积木到上方。',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifOr: {
    type: 'ifOr',
    label: '或者 (任一满足)',
    color: 'bg-block-compound-or',
    icon: '🔀',
    description: '任意一个子条件满足时，就执行内部指令。拖入"检测条件"积木到上方。',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifNot: {
    type: 'ifNot',
    label: '否则 (不满足)',
    color: 'bg-block-compound-not',
    icon: '🚫',
    description: '子条件不满足时，执行内部指令。拖入一个"检测条件"积木到上方。',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
};

export const CATEGORY_NAMES: Record<string, string> = {
  basic: '基础指令',
  control: '流程控制',
  condition: '条件判断（含执行）',
  'condition-atom': '🔬 检测条件（组合用）',
  function: '函数',
};

export function isConditionAtomType(type: BlockType): boolean {
  return type === 'condCheck';
}

export function isCompoundConditionType(type: BlockType): boolean {
  return type === 'ifAnd' || type === 'ifOr' || type === 'ifNot';
}

export const ALL_CONDITION_CONFIGS: Record<BlockType, BlockConfig> = {
  ...CONDITION_ATOM_CONFIGS,
  ...CONDITION_BLOCK_CONFIGS,
} as Record<BlockType, BlockConfig>;
