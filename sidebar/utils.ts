// 生成随机16进制颜色
export function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// 根据背景色的亮度计算出合适的文本颜色（黑色或白色）
function getContrastingTextColor(r: number, g: number, b: number) {
  // 计算颜色的亮度 (YIQ a.k.a. Luminance)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  // 如果亮度大于等于128，则背景为亮色，返回黑色文本；否则返回白色文本
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}
  
// 生成基于基础颜色的浅色变体
export function generateColorVariants(baseColor: string) {
  // 将16进制转换为RGB
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
    
  // 生成更浅的颜色用于背景
  const lightR = Math.min(255, r + 80);
  const lightG = Math.min(255, g + 80);
  const lightB = Math.min(255, b + 80);
  const lightBg = `rgb(${lightR}, ${lightG}, ${lightB})`;
  const veryLightBg = `rgb(${Math.min(255, r + 120)}, ${Math.min(255, g + 120)}, ${Math.min(255, b + 120)})`;
    
  // 生成半透明的颜色用于阴影
  const shadowColor = `rgba(${r}, ${g}, ${b}, 0.2)`;

  // 基于背景色的亮度决定文本颜色
  const textColor = getContrastingTextColor(lightR, lightG, lightB);
    
  return {
    background: `linear-gradient(to bottom right, ${veryLightBg}, ${lightBg})`,
    boxShadow: `0 4px 6px -1px ${shadowColor}, 0 2px 4px -1px ${shadowColor}`,
    borderColor: baseColor,
    textColor: textColor,
  };
}