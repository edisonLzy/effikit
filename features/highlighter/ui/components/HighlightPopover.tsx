import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HighlightColor } from '../../types';

/**
 * 弹出框位置信息
 */
export interface PopoverPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * 高亮弹出框的 Props
 */
export interface HighlightPopoverProps {
  /** 是否显示弹出框 */
  visible: boolean;
  /** 弹出框位置 */
  position: PopoverPosition;
  /** 高亮ID */
  highlightId: string;
  /** 高亮颜色 */
  color: HighlightColor;
  /** 高亮文本 */
  text: string;
  /** 元数据 */
  metadata?: Record<string, any>;
  /** 关闭回调 */
  onClose: () => void;
  /** 删除高亮回调 */
  onDelete: (id: string) => void;
  /** 更改颜色回调 */
  onColorChange: (id: string, color: HighlightColor) => void;
  /** 编辑回调 */
  onEdit?: (id: string) => void;
  /** 自定义操作 */
  customActions?: Array<{
    label: string;
    icon?: string;
    onClick: (id: string) => void;
  }>;
}

/**
 * 颜色选项
 */
const COLOR_OPTIONS: Array<{ value: HighlightColor; label: string; color: string }> = [
  { value: 'yellow', label: '黄色', color: '#ffff00' },
  { value: 'green', label: '绿色', color: '#00ff00' },
  { value: 'blue', label: '蓝色', color: '#0000ff' },
  { value: 'red', label: '红色', color: '#ff0000' },
  { value: 'purple', label: '紫色', color: '#800080' },
  { value: 'orange', label: '橙色', color: '#ffa500' },
  { value: 'pink', label: '粉色', color: '#ffc0cb' },
  { value: 'gray', label: '灰色', color: '#808080' }
];

/**
 * 高亮弹出框组件
 */
export const HighlightPopover: React.FC<HighlightPopoverProps> = ({
  visible,
  position,
  highlightId,
  color,
  text,
  metadata,
  onClose,
  onDelete,
  onColorChange,
  onEdit,
  customActions = []
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  /**
   * 计算弹出框位置
   */
  const calculatePosition = useCallback(() => {
    if (!popoverRef.current) return;

    const popover = popoverRef.current;
    const popoverRect = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let { x, y } = position;
    const offset = 10; // 偏移量

    // 水平位置调整
    if (x + popoverRect.width > viewportWidth) {
      x = viewportWidth - popoverRect.width - offset;
    }
    if (x < offset) {
      x = offset;
    }

    // 垂直位置调整
    if (y + popoverRect.height > viewportHeight) {
      y = position.y - popoverRect.height - offset;
    }
    if (y < offset) {
      y = offset;
    }

    setPopoverStyle({
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 10000
    });
  }, [position]);

  /**
   * 处理点击外部关闭
   */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  /**
   * 处理 ESC 键关闭
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // 监听位置变化
  useEffect(() => {
    if (visible) {
      calculatePosition();
    }
  }, [visible, position, calculatePosition]);

  // 监听点击外部和键盘事件
  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, handleClickOutside, handleKeyDown]);

  /**
   * 处理颜色选择
   */
  const handleColorSelect = (newColor: HighlightColor) => {
    onColorChange(highlightId, newColor);
    setShowColorPicker(false);
  };

  /**
   * 处理删除
   */
  const handleDelete = () => {
    if (confirm('确定要删除这个高亮吗？')) {
      onDelete(highlightId);
    }
  };

  /**
   * 处理编辑
   */
  const handleEdit = () => {
    if (onEdit) {
      onEdit(highlightId);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="effikit-highlight-popover"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 弹出框头部 */}
      <div className="popover-header">
        <div className="highlight-info">
          <span className="highlight-text" title={text}>
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </span>
          <span className="highlight-color-indicator" style={{ backgroundColor: COLOR_OPTIONS.find(opt => opt.value === color)?.color }} />
        </div>
        <button className="close-button" onClick={onClose} title="关闭">
          ×
        </button>
      </div>

      {/* 弹出框内容 */}
      <div className="popover-content">
        {/* 颜色选择器 */}
        <div className="color-section">
          <button
            className="color-picker-toggle"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="更改颜色"
          >
            <span className="color-icon" style={{ backgroundColor: COLOR_OPTIONS.find(opt => opt.value === color)?.color }} />
            颜色
          </button>
          
          {showColorPicker && (
            <div className="color-picker">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`color-option ${color === option.value ? 'selected' : ''}`}
                  style={{ backgroundColor: option.color }}
                  onClick={() => handleColorSelect(option.value)}
                  title={option.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="actions-section">
          {onEdit && (
            <button className="action-button edit-button" onClick={handleEdit} title="编辑">
              <span className="icon">✏️</span>
              编辑
            </button>
          )}
          
          <button className="action-button delete-button" onClick={handleDelete} title="删除">
            <span className="icon">🗑️</span>
            删除
          </button>
          
          {/* 自定义操作 */}
          {customActions.map((action, index) => (
            <button
              key={index}
              className="action-button custom-action"
              onClick={() => action.onClick(highlightId)}
              title={action.label}
            >
              {action.icon && <span className="icon">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>

        {/* 元数据显示 */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="metadata-section">
            <div className="metadata-title">元数据</div>
            <div className="metadata-content">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}:</span>
                  <span className="metadata-value">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 弹出框箭头 */}
      <div className="popover-arrow" />
    </div>
  );
};

/**
 * 弹出框样式
 */
export const popoverStyles = `
  .effikit-highlight-popover {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    max-width: 320px;
    min-width: 240px;
    user-select: none;
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #e1e5e9;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  }

  .highlight-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .highlight-text {
    flex: 1;
    font-weight: 500;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
  }

  .highlight-color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #ccc;
    flex-shrink: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #e9ecef;
    color: #333;
  }

  .popover-content {
    padding: 16px;
  }

  .color-section {
    margin-bottom: 16px;
    position: relative;
  }

  .color-picker-toggle {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border: 1px solid #e1e5e9;
    border-radius: 6px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    transition: all 0.2s;
    width: 100%;
  }

  .color-picker-toggle:hover {
    background: #e9ecef;
    border-color: #ced4da;
  }

  .color-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #ccc;
    margin-right: 8px;
  }

  .color-picker {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    z-index: 10001;
    margin-top: 4px;
  }

  .color-option {
    width: 32px;
    height: 32px;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .color-option:hover {
    transform: scale(1.1);
    border-color: #333;
  }

  .color-option.selected {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .actions-section {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .action-button {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border: 1px solid #e1e5e9;
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    color: #333;
    transition: all 0.2s;
    flex: 1;
    min-width: 0;
  }

  .action-button:hover {
    background: #e9ecef;
    border-color: #ced4da;
  }

  .action-button .icon {
    margin-right: 4px;
    font-size: 14px;
  }

  .delete-button:hover {
    background: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }

  .edit-button:hover {
    background: #d1ecf1;
    border-color: #bee5eb;
    color: #0c5460;
  }

  .metadata-section {
    border-top: 1px solid #e1e5e9;
    padding-top: 12px;
  }

  .metadata-title {
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .metadata-content {
    max-height: 120px;
    overflow-y: auto;
  }

  .metadata-item {
    display: flex;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .metadata-key {
    color: #666;
    font-weight: 500;
    margin-right: 8px;
    min-width: 60px;
  }

  .metadata-value {
    color: #333;
    flex: 1;
    word-break: break-word;
  }

  .popover-arrow {
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background: white;
    border: 1px solid #e1e5e9;
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }
`;