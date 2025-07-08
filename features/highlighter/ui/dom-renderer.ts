import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { shadowStyleManager } from '../shadow-style-manager';

type ComponentType = 'color-popover' | 'content-popover';

interface PopoverInstance {
  id: string;
  root: Root;
  shadowHost: HTMLElement;
  shadowRoot: ShadowRoot;
  componentType: ComponentType;
}

/**
 * 管理在页面上动态渲染和卸载 React 组件，使用 Shadow DOM 实现样式隔离
 */
class DomRenderer {
  private instances: Map<string, PopoverInstance> = new Map();
  private nextId = 0;

  /**
   * 渲染一个组件到页面上的 Shadow DOM 中
   * @param component - 要渲染的 React 元素
   * @param componentType - 组件的类型
   * @returns 实例 ID，用于后续操作
   */
  render(component: React.ReactElement, componentType: ComponentType): string {
    const id = `${componentType}-${this.nextId++}`;

    // 清理同类型的旧实例
    this.unmountAll(componentType);

    // 创建 Shadow DOM host，使用 ShadowStyleManager 的统一样式管理
    const { host: shadowHost, shadowRoot } = shadowStyleManager.createShadowHost(id, 'popover');

    // 在 Shadow DOM 中创建 React 渲染容器
    const reactContainer = document.createElement('div');
    reactContainer.id = `react-container-${id}`;
    shadowRoot.appendChild(reactContainer);

    // 创建 React root 并渲染组件
    const root = createRoot(reactContainer);
    root.render(component);

    this.instances.set(id, { 
      id, 
      root, 
      shadowHost, 
      shadowRoot, 
      componentType 
    });
    
    return id;
  }

  /**
   * 卸载指定 ID 的组件实例
   * @param id - 实例 ID
   */
  unmount(id: string): void {
    const instance = this.instances.get(id);
    if (instance) {
      instance.root.unmount();
      shadowStyleManager.destroyShadowHost(instance.id);
      this.instances.delete(id);
    }
  }

  /**
   * 卸载所有指定类型的组件实例
   * @param componentType - 要卸载的组件类型
   */
  unmountAll(componentType?: ComponentType): void {
    const idsToUnmount: string[] = [];
    this.instances.forEach(instance => {
      if (!componentType || instance.componentType === componentType) {
        idsToUnmount.push(instance.id);
      }
    });
    idsToUnmount.forEach(id => this.unmount(id));
  }

  /**
   * 检查指定类型的组件是否可见
   * @param componentType - 组件类型
   * @returns 是否有该类型的实例存在
   */
  isVisible(componentType: ComponentType): boolean {
    for (const instance of this.instances.values()) {
      if (instance.componentType === componentType) {
        return true;
      }
    }
    return false;
  }
}

// 导出单例
export const domRenderer = new DomRenderer(); 