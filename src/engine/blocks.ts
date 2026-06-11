import type { BlockConfig, BlockType } from './types';
import { ALL_CONDITION_CONFIGS, CATEGORY_NAMES } from './conditionBlocks';

export { CATEGORY_NAMES } from './conditionBlocks';
export {
  DIRECTION_LABELS,
  DIRECTION_ICONS,
  TARGET_LABELS,
  TARGET_ICONS,
  isConditionAtomType,
  isCompoundConditionType,
} from './conditionBlocks';

const BASIC_BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
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
} as unknown as Record<BlockType, BlockConfig>;

export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  ...BASIC_BLOCK_CONFIGS,
  ...ALL_CONDITION_CONFIGS,
} as Record<BlockType, BlockConfig>;
