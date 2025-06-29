import { useState, useCallback, useMemo } from 'react';
import { 
  Copy, 
  RotateCcw, 
  Palette,
  Check,
  Shuffle,
  Pipette
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [inputValue, setInputValue] = useState('#3b82f6');
  const [copied, setCopied] = useState<string | null>(null);

  // 颜色转换函数
  const colorData = useMemo((): ColorData => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s;
      const l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    };

    const rgbToCmyk = (r: number, g: number, b: number) => {
      r /= 255;
      g /= 255;
      b /= 255;

      const k = 1 - Math.max(r, Math.max(g, b));
      const c = (1 - r - k) / (1 - k) || 0;
      const m = (1 - g - k) / (1 - k) || 0;
      const y = (1 - b - k) / (1 - k) || 0;

      return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
      };
    };

    const rgb = hexToRgb(selectedColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    return {
      hex: selectedColor.toUpperCase(),
      rgb,
      hsl,
      cmyk
    };
  }, [selectedColor]);

  // 生成调色板
  const colorPalette = useMemo(() => {
    const base = colorData.hsl;
    const variations = [
      { ...base, l: Math.min(90, base.l + 30) },
      { ...base, l: Math.min(80, base.l + 20) },
      { ...base, l: Math.min(70, base.l + 10) },
      base,
      { ...base, l: Math.max(30, base.l - 10) },
      { ...base, l: Math.max(20, base.l - 20) },
      { ...base, l: Math.max(10, base.l - 30) },
    ];

    return variations.map(({ h, s, l }) => {
      const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      };
      return hslToHex(h, s, l);
    });
  }, [colorData.hsl]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  }, []);

  // 生成随机颜色
  const generateRandomColor = useCallback(() => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setSelectedColor(randomHex);
    setInputValue(randomHex);
  }, []);

  // 处理输入变化
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    
    // 验证hex格式
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setSelectedColor(value);
    }
  }, []);

  // 清空输入
  const clearInput = useCallback(() => {
    setInputValue('');
  }, []);

  return (
    <div className="flex flex-col h-full bg-black p-6">
      {/* 标题区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">颜色选择器</h1>
        </div>
        <p className="text-gray-300">
          颜色格式转换、调色板生成和设计配色工具
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：颜色选择和输入 */}
        <div className="space-y-6">
          {/* 颜色预览 */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-white">颜色预览</Label>
              
              <div className="relative">
                <div 
                  className="w-full h-32 rounded-lg border-2 border-gray-600 cursor-pointer shadow-lg"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = selectedColor;
                    input.addEventListener('change', (e) => {
                      const newColor = (e.target as HTMLInputElement).value;
                      setSelectedColor(newColor);
                      setInputValue(newColor);
                    });
                    input.click();
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                  <Pipette className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRandomColor}
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  随机颜色
                </Button>
              </div>
            </div>
          </Card>

          {/* 颜色输入 */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">颜色输入</Label>
                {inputValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearInput}
                    className="h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                    title="清空输入"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              <Input
                placeholder="输入HEX颜色值，如 #3b82f6"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-white font-mono"
              />
              
              {inputValue && !/^#[0-9A-F]{6}$/i.test(inputValue) && (
                <p className="text-red-400 text-xs">
                  请输入有效的HEX颜色值（如：#FF0000）
                </p>
              )}
            </div>
          </Card>

          {/* 调色板 */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-4">
              <Label className="text-sm font-medium text-white">色彩变化</Label>
              
              <div className="grid grid-cols-7 gap-2">
                {colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded cursor-pointer border-2 border-gray-600 hover:border-white transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setInputValue(color);
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：颜色信息 */}
        <div className="space-y-6">
          {/* HEX */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">HEX</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(colorData.hex, 'hex')}
                  className="gap-1 h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  {copied === 'hex' ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      复制
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-600 font-mono text-white">
                {colorData.hex}
              </div>
            </div>
          </Card>

          {/* RGB */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">RGB</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`rgb(${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b})`, 'rgb')}
                  className="gap-1 h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  {copied === 'rgb' ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      复制
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-600 font-mono text-white">
                rgb({colorData.rgb.r}, {colorData.rgb.g}, {colorData.rgb.b})
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-red-400">R: {colorData.rgb.r}</div>
                <div className="text-green-400">G: {colorData.rgb.g}</div>
                <div className="text-blue-400">B: {colorData.rgb.b}</div>
              </div>
            </div>
          </Card>

          {/* HSL */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">HSL</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`hsl(${colorData.hsl.h}, ${colorData.hsl.s}%, ${colorData.hsl.l}%)`, 'hsl')}
                  className="gap-1 h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  {copied === 'hsl' ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      复制
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-600 font-mono text-white">
                hsl({colorData.hsl.h}, {colorData.hsl.s}%, {colorData.hsl.l}%)
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-purple-400">H: {colorData.hsl.h}°</div>
                <div className="text-pink-400">S: {colorData.hsl.s}%</div>
                <div className="text-yellow-400">L: {colorData.hsl.l}%</div>
              </div>
            </div>
          </Card>

          {/* CMYK */}
          <Card className="p-4 bg-gray-900 border-gray-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">CMYK</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`cmyk(${colorData.cmyk.c}%, ${colorData.cmyk.m}%, ${colorData.cmyk.y}%, ${colorData.cmyk.k}%)`, 'cmyk')}
                  className="gap-1 h-6 px-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  {copied === 'cmyk' ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      复制
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-600 font-mono text-white">
                cmyk({colorData.cmyk.c}%, {colorData.cmyk.m}%, {colorData.cmyk.y}%, {colorData.cmyk.k}%)
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-cyan-400">C: {colorData.cmyk.c}%</div>
                <div className="text-magenta-400">M: {colorData.cmyk.m}%</div>
                <div className="text-yellow-400">Y: {colorData.cmyk.y}%</div>
                <div className="text-gray-400">K: {colorData.cmyk.k}%</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 