// 标签类型枚举
export type TagType = 'word' | 'annotation' | 'sentence';

// 高亮颜色类型
export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green' | 'purple' | 'orange';

// 位置范围信息
export interface TextRange {
  startOffset: number;
  endOffset: number;
  startContainer: string;
  endContainer: string;
}

// 单词标签内容 - 字典信息
export interface WordTagContent {
  phonetic?: string;          // 音标
  partOfSpeech?: string;      // 词性
  definitions: string[];      // 词义列表
  conjugations?: {            // 不同时态/形式
    [form: string]: string;   // 如 past: 'went', present: 'go'
  };
  synonyms?: string[];        // 同义词
  antonyms?: string[];        // 反义词
  examples?: string[];        // 例句
}

// 批注标签内容 - 用户输入
export interface AnnotationTagContent {
  note: string;               // 用户批注内容
  createdAt: number;          // 创建时间
  updatedAt: number;          // 更新时间
}

// 句子标签内容 - 句子分析
export interface SentenceTagContent {
  translation?: string;       // 翻译
  grammar?: string;           // 语法分析
  structure?: string;         // 句子结构
  keyPoints?: string[];       // 重点词汇/语法点
}

// 标签内容联合类型
export type TagContent = WordTagContent | AnnotationTagContent | SentenceTagContent;

// 标签定义
export interface HighlightTag {
  id: string;                 // 标签唯一ID
  type: TagType;              // 标签类型
  title: string;              // 标签显示名称
  content: TagContent;        // 标签内容
  createdAt: number;          // 创建时间
  updatedAt: number;          // 更新时间
  isActive?: boolean;         // 是否为当前激活标签
}

// 重新设计的高亮数据结构
export interface Highlight {
  id: string;                 // 高亮唯一ID
  text: string;               // 高亮文本内容
  url: string;                // 页面URL
  color: HighlightColor;      // 高亮颜色
  range: TextRange;           // 文本位置范围
  tags: HighlightTag[];       // 关联的标签列表
  timestamp: number;          // 创建时间
  lastModified: number;       // 最后修改时间
}

// 高亮载荷（用于创建高亮时传递数据）
export interface HighlightPayload {
  text: string;
  url: string;
  color: HighlightColor;
  range: TextRange;
  initialTags?: Partial<HighlightTag>[];  // 可选的初始标签
}

// 存储结构
export interface HighlightStorage {
  [url: string]: Highlight[];
}

// 设置结构
export interface HighlightSettings {
  enabled: boolean;
  defaultColor: HighlightColor;
  autoCreateWordTag: boolean;     // 是否自动创建单词标签
  autoCreateSentenceTag: boolean; // 是否自动创建句子标签
}

// 标签创建选项
export interface TagCreationOptions {
  type: TagType;
  highlightId: string;
  initialContent?: Partial<TagContent>;
}

// 高亮内容弹出框的数据接口
export interface HighlightContentPopoverData {
  highlight: Highlight;
  activeTagId?: string;         // 当前激活的标签ID
  position: {
    x: number;
    y: number;
  };
} 