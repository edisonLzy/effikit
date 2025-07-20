/**
 * 获取颜色值
 */
function getColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    yellow: '#fff3cd',
    red: '#f8d7da',
    blue: '#cce5ff',
    green: '#d4edda',
    purple: '#e2d9f3',
    orange: '#ffeaa7',
    pink: '#f8d7da',
    gray: '#e9ecef'
  };
  return colorMap[color] || colorMap.yellow;
}

/**
 * effikit-highlight 自定义元素
 */

export class HighlightElement extends HTMLElement {

  static tagName = 'effikit-highlight';

  static nodeName = 'EFFIKIT-HIGHLIGHT';

  static get observedAttributes() {
    return ['data-highlight-id', 'data-highlight-color'];
  }

  static create(id: string, color: string) {
    const highlightElement = document.createElement(HighlightElement.tagName);
    highlightElement.setAttribute('data-highlight-id', id);
    highlightElement.setAttribute('data-highlight-color', color);
    return highlightElement;
  }

  constructor() {
    super();
    this.addEventListener('click', this.handleClick.bind(this));
  }

  connectedCallback() {
    const color = this.getAttribute('data-highlight-color') || 'yellow';
    this.style.cssText = `
      background-color: ${getColorValue(color)};
      cursor: pointer;
      border-radius: 2px;
      padding: 1px 2px;
      display: inline;
      line-height: inherit;
    `;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-highlight-color' && oldValue !== newValue) {
      this.style.backgroundColor = getColorValue(newValue || 'yellow');
    }
  }

  private handleClick(event: Event) {
    event.stopPropagation();
    const highlightId = this.getAttribute('data-highlight-id');
    
    // 发送点击事件，可以用于显示高亮详情
    const customEvent = new CustomEvent('effikit:highlight:click', {
      detail: { 
        id: highlightId,
        element: this
      },
      bubbles: true
    });
    this.dispatchEvent(customEvent);
  }

  /**
   * 获取高亮ID
   */
  getHighlightId(): string | null {
    return this.getAttribute('data-highlight-id');
  }

  /**
   * 获取高亮颜色
   */
  getHighlightColor(): string | null {
    return this.getAttribute('data-highlight-color');
  }

  /**
   * 设置高亮颜色
   */
  setHighlightColor(color: string): void {
    this.setAttribute('data-highlight-color', color);
  }
}
