import type { BlockConfig, BlockType, ConditionDirection, ConditionTarget } from './types';

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

export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  move: {
    type: 'move',
    label: '前进',
    color: 'bg-block-move',
    icon: '➡️',
    description: '机器人向前移动一格',
    category: 'basic',
  },
  turnLeft: {
    type: 'turnLeft',
    label: '左转',
    color: 'bg-block-turn',
    icon: '↪️',
    description: '机器人向左转90度',
    category: 'basic',
  },
  turnRight: {
    type: 'turnRight',
    label: '右转',
    color: 'bg-block-turn',
    icon: '↩️',
    description: '机器人向右转90度',
    category: 'basic',
  },
  loop: {
    type: 'loop',
    label: '循环',
    color: 'bg-block-loop',
    icon: '🔄',
    description: '重复执行内部指令指定次数',
    category: 'control',
    hasChildren: true,
    canRepeat: true,
  },
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
    label: '检查条件',
    color: 'bg-block-condition',
    icon: '🔍',
    description: '检查指定方向是否有指定目标，可自由配置方向和目标',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
    isConditionAtom: true,
  },
  ifAnd: {
    type: 'ifAnd',
    label: '并且 (全部满足)',
    color: 'bg-block-compound-and',
    icon: '🔗',
    description: '所有子条件都满足时，才执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifOr: {
    type: 'ifOr',
    label: '或者 (任一满足)',
    color: 'bg-block-compound-or',
    icon: '🔀',
    description: '任意一个子条件满足时，就执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  ifNot: {
    type: 'ifNot',
    label: '否则 (不满足)',
    color: 'bg-block-compound-not',
    icon: '🚫',
    description: '子条件不满足时，执行内部指令',
    category: 'condition',
    hasChildren: true,
    hasConditionBody: true,
  },
  function: {
    type: 'function',
    label: '定义函数',
    color: 'bg-block-function',
    icon: '📦',
    description: '定义一个可重复调用的函数',
    category: 'function',
    hasChildren: true,
  },
  callFunction: {
    type: 'callFunction',
    label: '调用函数',
    color: 'bg-block-function',
    icon: '🔧',
    description: '调用已定义的函数',
    category: 'function',
  },
};

export const CATEGORY_NAMES: Record<string, string> = {
  basic: '基础指令',
  control: '流程控制',
  condition: '条件判断',
  function: '函数',
};
