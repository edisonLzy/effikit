// 生成随机16进制颜色
export function getRandomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }
  
  // 生成基于基础颜色的浅色变体
export function generateColorVariants(baseColor: string) {
    // 将16进制转换为RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // 生成更浅的颜色用于背景
    const lightBg = `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`;
    const veryLightBg = `rgb(${Math.min(255, r + 120)}, ${Math.min(255, g + 120)}, ${Math.min(255, b + 120)})`;
    
    // 生成半透明的颜色用于阴影
    const shadowColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
    
    return {
      background: `linear-gradient(to bottom right, ${veryLightBg}, ${lightBg})`,
      boxShadow: `0 4px 6px -1px ${shadowColor}, 0 2px 4px -1px ${shadowColor}`,
      borderColor: baseColor,
    };
  }