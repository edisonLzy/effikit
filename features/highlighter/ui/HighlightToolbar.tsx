import React, { useState, useEffect, useRef } from 'react';
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
import { ReactCustomElement } from './ReactCustomElement';

interface ToolbarState {
  isHighlighted: boolean;
  selectedColor: string;
  position: { x: number; y: number };
  visible: boolean;
}

interface HighlightToolbarProps {
  onHighlight?: () => void;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
  initialState?: Partial<ToolbarState>;
}

function TagsArea() {
  return (
    <div className="tags-area">
      <div className="tags-placeholder">标签区域（待实现）</div>
    </div>
  );
}

interface ToolbarActionsProps {
  isHighlighted: boolean;
  onHighlight: () => void;
  onColorChange: () => void;
  onDelete: () => void;
}

function ToolbarActions({ isHighlighted, onHighlight, onColorChange, onDelete }: ToolbarActionsProps) {
  return (
    <div className="toolbar-actions">
      <button 
        className="highlight-btn" 
        data-action="highlight"
        disabled={isHighlighted}
        onClick={onHighlight}
      >
        高亮
      </button>
      <button 
        className="color-btn" 
        data-action="color"
        onClick={onColorChange}
      >
        颜色
      </button>
      <button 
        className="delete-btn" 
        data-action="delete"
        disabled={!isHighlighted}
        onClick={onDelete}
      >
        删除
      </button>
    </div>
  );
}

function HighlightToolbar(props: HighlightToolbarProps) {
  const {
    onHighlight = () => {},
    onColorChange = () => {},
    onDelete = () => {},
    initialState = {}
  } = props;

  const [state, setState] = useState<ToolbarState>({
    isHighlighted: false,
    selectedColor: '#fff3cd',
    position: { x: 0, y: 0 },
    visible: false,
    ...initialState
  });

  const toolbarRef = useRef<HTMLDivElement>(null);
  const virtualElementRef = useRef<{ getBoundingClientRect: () => DOMRect } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 创建虚拟元素用于定位
  const createVirtualElement = (x: number, y: number) => {
    return {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x,
          y,
          top: y,
          left: x,
          right: x,
          bottom: y,
        } as DOMRect;
      },
    };
  };

  // 更新工具栏位置
  const updatePosition = async () => {
    if (!toolbarRef.current || !virtualElementRef.current) return;

    try {
      const { x, y } = await computePosition(
        virtualElementRef.current,
        toolbarRef.current,
        {
          placement: 'top',
          middleware: [
            offset(10),
            flip(),
            shift({ padding: 8 })
          ],
        }
      );

      Object.assign(toolbarRef.current.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    } catch (error) {
      console.error('Failed to update toolbar position:', error);
    }
  };

  // 显示工具栏
  const showToolbar = (selection: Selection, position: { x: number; y: number }) => {
    virtualElementRef.current = createVirtualElement(position.x, position.y);
    
    setState(prev => ({
      ...prev,
      position,
      visible: true
    }));

    // 设置自动更新位置
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    
    setTimeout(() => {
      if (toolbarRef.current && virtualElementRef.current) {
        cleanupRef.current = autoUpdate(
          virtualElementRef.current,
          toolbarRef.current,
          updatePosition
        );
      }
    }, 0);
  };

  // 隐藏工具栏
  const hideToolbar = () => {
    setState(prev => ({ ...prev, visible: false }));
    
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  };

  // 处理按钮点击事件
  const handleHighlight = () => {
    onHighlight();
    setState(prev => ({ ...prev, isHighlighted: true }));
  };

  const handleColorChange = () => {
    onColorChange(state.selectedColor);
  };

  const handleDelete = () => {
    onDelete();
    setState(prev => ({ ...prev, isHighlighted: false }));
  };

  // 处理ESC键隐藏工具栏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.visible) {
        hideToolbar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.visible]);

  // 处理点击外部区域隐藏工具栏
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state.visible && toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        hideToolbar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.visible]);

  // 清理定位更新
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // 暴露方法给外部使用
  useEffect(() => {
    if (toolbarRef.current) {
      (toolbarRef.current as any).showToolbar = showToolbar;
      (toolbarRef.current as any).hideToolbar = hideToolbar;
      (toolbarRef.current as any).updateHighlightState = (isHighlighted: boolean) => {
        setState(prev => ({ ...prev, isHighlighted }));
      };
    }
  }, []);

  if (!state.visible) {
    return null;
  }

  return (
    <div 
      ref={toolbarRef}
      className="effikit-highlight-toolbar"
      style={{
        position: 'absolute',
        zIndex: 10000,
        backgroundColor: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '8px',
        minWidth: '200px',
        opacity: state.visible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px'
      }}
    >
      <TagsArea />
      <ToolbarActions 
        isHighlighted={state.isHighlighted}
        onHighlight={handleHighlight}
        onColorChange={handleColorChange}
        onDelete={handleDelete}
      />
    </div>
  );
}

// 创建自定义元素类
export class HighlightToolbarElement extends ReactCustomElement {

  static singleton: HighlightToolbarElement | null = null;

  static tagName = 'effikit-highlight-toolbar';

  static get observedAttributes() {
    return ['visible', 'position', 'is-highlighted'];
  }

  static createSingletonInstance() {
    if (!HighlightToolbarElement.singleton) {
      HighlightToolbarElement.singleton = new HighlightToolbarElement();
      document.body.appendChild(HighlightToolbarElement.singleton);
    }
    return HighlightToolbarElement.singleton;
  }

  protected createReactComponent(): React.ReactElement {
    const visible = this.getAttribute('visible') === 'true';
    const position = this.getAttribute('position') ? JSON.parse(this.getAttribute('position')!) : { x: 0, y: 0 };
    const isHighlighted = this.getAttribute('is-highlighted') === 'true';

    return React.createElement(HighlightToolbar, {
      initialState: {
        visible,
        position,
        isHighlighted
      },
      onHighlight: () => {
        this.dispatchCustomEvent('highlight');
      },
      onColorChange: (color: string) => {
        this.dispatchCustomEvent('color-change', { color });
      },
      onDelete: () => {
        this.dispatchCustomEvent('delete');
      }
    });
  }

  protected createStyleSheet(): CSSStyleSheet {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      :host {
        position: fixed;
        z-index: 10000;
        pointer-events: auto;
      }
      
      .effikit-highlight-toolbar {
        background-color: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px;
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
      }
      
      .tags-area {
        padding: 4px 0;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 8px;
      }
      
      .tags-placeholder {
        color: #999;
        font-size: 12px;
        text-align: center;
      }
      
      .toolbar-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      
      .toolbar-actions button {
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      
      .toolbar-actions button:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
      }
      
      .toolbar-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .highlight-btn {
        color: #059669;
        border-color: #059669;
      }
      
      .color-btn {
        color: #7c3aed;
        border-color: #7c3aed;
      }
      
      .delete-btn {
        color: #dc2626;
        border-color: #dc2626;
      }
    `);
    return sheet;
  }

  // 公共方法
  showToolbar(selection: Selection, position: { x: number; y: number }) {
    this.setAttribute('visible', 'true');
    this.setAttribute('position', JSON.stringify(position));
    this.style.left = `${position.x}px`;
    this.style.top = `${position.y}px`;
  }

  hideToolbar() {
    this.setAttribute('visible', 'false');
  }

  updateHighlightState(isHighlighted: boolean) {
    this.setAttribute('is-highlighted', isHighlighted.toString());
  }

  disconnectedCallback(): void {
    //
    super.disconnectedCallback();
    //
    HighlightToolbarElement.singleton = null;
  }
}

export { HighlightToolbar };