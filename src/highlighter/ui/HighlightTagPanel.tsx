import React, { useLayoutEffect, useState } from 'react';
import { Plus, MessageSquare, BookOpen, X, Edit3, Check, XIcon } from 'lucide-react';
import { useFloating, autoUpdate, offset, flip, shift, useDismiss, useInteractions } from '@floating-ui/react';
import { ReactCustomElement } from './ReactCustomElement';
import type { VirtualElement } from '@floating-ui/react';
import type { HighlightTag, TagType, AnnotationTagContent } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('HighlightTagPanel');

export interface HighlightTagPanelAttributes {
  open: boolean;
  highlightId: string;
  position: string; // JSON stringified DOMRect
  tags: string; // JSON stringified HighlightTag[]
}

interface HighlightTagPanelProps {
  attributes: HighlightTagPanelAttributes;
}

interface TagItemProps {
  tag: HighlightTag;
  onDelete: (tagId: string) => void;
  onEdit: (tagId: string, content: any) => void;
}

// 标签类型图标映射
const TAG_TYPE_ICONS = {
  annotation: MessageSquare,
  word: BookOpen,
  sentence: BookOpen,
} as const;

// 标签类型名称映射
const TAG_TYPE_NAMES = {
  annotation: '注释',
  word: '词汇',
  sentence: '句子',
} as const;

// 单个标签组件
function TagItem({ tag, onDelete, onEdit }: TagItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const IconComponent = TAG_TYPE_ICONS[tag.type];
  const typeName = TAG_TYPE_NAMES[tag.type];

  // 获取标签显示内容
  const getDisplayContent = () => {
    if (tag.type === 'annotation') {
      const content = tag.content as AnnotationTagContent;
      return content.note;
    }
    // 其他类型暂时返回空
    return '';
  };

  const handleEdit = () => {
    setEditContent(getDisplayContent());
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tag.type === 'annotation') {
      const updatedContent: AnnotationTagContent = {
        note: editContent,
        createdAt: (tag.content as AnnotationTagContent).createdAt,
        updatedAt: Date.now(),
      };
      onEdit(tag.id, updatedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };

  return (
    <div className="tag-item">
      <div className="tag-header">
        <div className="tag-info">
          <IconComponent size={14} className="tag-icon" />
          <span className="tag-type">{typeName}</span>
        </div>
        <div className="tag-actions">
          {!isEditing && tag.type === 'annotation' && (
            <button
              className="tag-action-btn edit-btn"
              onClick={handleEdit}
              title="编辑"
            >
              <Edit3 size={12} />
            </button>
          )}
          <button
            className="tag-action-btn delete-btn"
            onClick={() => onDelete(tag.id)}
            title="删除"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="tag-content">
        {isEditing ? (
          <div className="tag-edit-area">
            <textarea
              className="tag-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="输入注释内容..."
              rows={3}
              autoFocus
            />
            <div className="tag-edit-actions">
              <button className="tag-edit-btn save-btn" onClick={handleSave}>
                <Check size={12} />
                保存
              </button>
              <button className="tag-edit-btn cancel-btn" onClick={handleCancel}>
                <XIcon size={12} />
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="tag-display-content">
            {getDisplayContent() || '暂无内容'}
          </div>
        )}
      </div>
    </div>
  );
}

// 操作区域组件
function OperationArea({
  onAddTag,
  existingTagTypes
}: {
  onAddTag: (type: TagType) => void;
  existingTagTypes: TagType[];
}) {
  const [selectedType, setSelectedType] = useState<TagType>('annotation');

  const availableTypes: { value: TagType; label: string }[] = [
    { value: 'annotation', label: '注释' },
    { value: 'word', label: '词汇' },
  ];

  const canAddType = (type: TagType) => {
    return !existingTagTypes.includes(type);
  };

  const handleAddTag = () => {
    if (canAddType(selectedType)) {
      onAddTag(selectedType);
    }
  };

  return (
    <div className="operation-area">
      <button
        className="add-tag-btn"
        onClick={handleAddTag}
        disabled={!canAddType(selectedType)}
        title={canAddType(selectedType) ? '添加标签' : '该类型标签已存在'}
      >
        <Plus size={14} />
        添加标签
      </button>

      <select
        className="tag-type-selector"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as TagType)}
      >
        {availableTypes.map(type => (
          <option
            key={type.value}
            value={type.value}
            disabled={!canAddType(type.value)}
          >
            {type.label}
            {!canAddType(type.value) ? ' (已存在)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

// 主组件
function HighlightTagPanel(props: HighlightTagPanelProps) {
  const { attributes } = props;
  const { open, highlightId, position, tags: tagsJson } = attributes;

  // 解析标签数据
  const tags: HighlightTag[] = React.useMemo(() => {
    try {
      return tagsJson ? JSON.parse(tagsJson) : [];
    } catch (error) {
      logger.error('Failed to parse tags:', error);
      return [];
    }
  }, [tagsJson]);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, {
    enabled: open,
    outsidePress: true,
    escapeKey: true,
  });
  const { getFloatingProps } = useInteractions([dismiss]);

  // 处理面板关闭
  const handleClose = React.useCallback(() => {
    const event = new CustomEvent('effikit:tag-panel:close', {
      detail: { highlightId },
      bubbles: true
    });
    document.dispatchEvent(event);
  }, [highlightId]);

  // 监听floating-ui的dismiss事件
  React.useEffect(() => {
    if (!open) return;

    // 监听escape键
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };

    // 点击外部关闭处理函数
    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      const floatingElement = refs.floating.current;

      // 检查点击是否在面板外部
      if (floatingElement && !floatingElement.contains(target)) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    // 延迟添加点击外部监听器，避免立即触发
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [open, handleClose, refs.floating, highlightId]);

  // 设置定位参考
  useLayoutEffect(() => {
    if (!open || !position) {
      return;
    }

    try {
      const parsedPosition: DOMRect = JSON.parse(position);
      const { left, top, right, bottom } = parsedPosition;

      const virtualElement: VirtualElement = {
        getBoundingClientRect() {
          return {
            left,
            top,
            right,
            bottom,
            height: bottom - top,
            width: right - left,
            x: left,
            y: top
          };
        }
      };

      refs.setReference(virtualElement);
    } catch (error) {
      logger.error('Failed to parse position:', error);
    }
  }, [position, open, refs]);

  // 处理添加标签
  const handleAddTag = (type: TagType) => {
    const event = new CustomEvent('effikit:tag:add', {
      detail: { highlightId, type },
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  // 处理删除标签
  const handleDeleteTag = (tagId: string) => {
    const event = new CustomEvent('effikit:tag:delete', {
      detail: { highlightId, tagId },
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  // 处理编辑标签
  const handleEditTag = (tagId: string, content: any) => {
    const event = new CustomEvent('effikit:tag:edit', {
      detail: { highlightId, tagId, content },
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  // 获取已存在的标签类型
  const existingTagTypes = tags.map(tag => tag.type);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className="highlight-tag-panel"
    >
      <OperationArea
        onAddTag={handleAddTag}
        existingTagTypes={existingTagTypes}
      />

      <div className="tags-content-area">
        {tags.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={24} className="empty-icon" />
            <p className="empty-text">暂无标签</p>
            <p className="empty-hint">点击上方按钮添加标签</p>
          </div>
        ) : (
          <div className="tags-list">
            {tags.map(tag => (
              <TagItem
                key={tag.id}
                tag={tag}
                onDelete={handleDeleteTag}
                onEdit={handleEditTag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Element 类
export class HighlightTagPanelElement extends ReactCustomElement {
  static singleton: HighlightTagPanelElement | null = null;
  static tagName = 'effikit-highlight-tag-panel';

  static get observedAttributes() {
    return ['open', 'highlightId', 'position', 'tags'];
  }

  static getInstance() {
    if (!HighlightTagPanelElement.singleton) {
      HighlightTagPanelElement.singleton = new HighlightTagPanelElement();
      document.body.appendChild(HighlightTagPanelElement.singleton);
    }
    return HighlightTagPanelElement.singleton;
  }

  protected createReactComponent(): React.ReactElement {
    const open = this.getAttribute('open') === 'true';
    const highlightId = this.getAttribute('highlightId') || '';
    const position = this.getAttribute('position') || '';
    const tags = this.getAttribute('tags') || '';

    return React.createElement(HighlightTagPanel, {
      attributes: {
        open,
        highlightId,
        position,
        tags
      }
    });
  }

  protected createStyleSheet(): CSSStyleSheet {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      :host {
        position: fixed;
        z-index: 10001;
        pointer-events: auto;
      }

      @keyframes effikit-panel-fadein {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .highlight-tag-panel {
        background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 12px;
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.08),
          0 8px 32px rgba(0, 0, 0, 0.12),
          0 0 0 1px rgba(255, 255, 255, 0.8) inset;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        animation: effikit-panel-fadein 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(12px);
        min-width: 280px;
        max-width: 400px;
        min-height: 120px;
      }

      /* 操作区域样式 */
      .operation-area {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .add-tag-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 6px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
        color: #10b981;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-tag-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
      }

      .add-tag-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .tag-type-selector {
        padding: 6px 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 6px;
        background: white;
        font-size: 12px;
        cursor: pointer;
        transition: border-color 0.2s ease;
      }

      .tag-type-selector:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
      }

      /* 标签内容区域样式 */
      .tags-content-area {
        min-height: 60px;
      }

      .empty-state {
        text-align: center;
        padding: 20px;
        color: #6b7280;
      }

      .empty-icon {
        margin: 0 auto 8px;
        opacity: 0.5;
      }

      .empty-text {
        margin: 0 0 4px;
        font-weight: 500;
        font-size: 14px;
      }

      .empty-hint {
        margin: 0;
        font-size: 12px;
        opacity: 0.7;
      }

      .tags-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* 单个标签样式 */
      .tag-item {
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.7);
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .tag-item:hover {
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .tag-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(248, 250, 252, 0.8);
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }

      .tag-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #374151;
      }

      .tag-icon {
        opacity: 0.7;
      }

      .tag-actions {
        display: flex;
        gap: 4px;
      }

      .tag-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.6;
      }

      .tag-action-btn:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.05);
      }

      .edit-btn {
        color: #3b82f6;
      }

      .delete-btn {
        color: #ef4444;
      }

      .tag-content {
        padding: 12px;
      }

      .tag-display-content {
        font-size: 13px;
        line-height: 1.5;
        color: #374151;
      }

      /* 编辑区域样式 */
      .tag-edit-area {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .tag-textarea {
        width: 100%;
        min-height: 60px;
        padding: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.5;
        resize: vertical;
        font-family: inherit;
      }

      .tag-textarea:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
      }

      .tag-edit-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }

      .tag-edit-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .save-btn {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }

      .save-btn:hover {
        background: #059669;
      }

      .cancel-btn {
        background: white;
        color: #6b7280;
      }

      .cancel-btn:hover {
        background: #f9fafb;
        color: #374151;
      }
    `);
    return sheet;
  }

  // 公共方法
  showPanel(options: {
    highlightId: string;
    tags: HighlightTag[];
    position: DOMRect;
  }) {
    const { highlightId, tags, position } = options;

    this.updatePanel({
      open: true,
      highlightId,
      tags: JSON.stringify(tags),
      position: JSON.stringify(position.toJSON())
    });
  }

  hidePanel() {
    this.updatePanel({ open: false });
  }

  updatePanel(attributes: Partial<HighlightTagPanelAttributes>) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined) {
        this.setAttribute(key, value.toString());
      }
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    HighlightTagPanelElement.singleton = null;
  }
}

export { HighlightTagPanel };