import React from 'react';
import type { HighlightColor } from '../types';
import { getHighlightColors } from '../utils';

export interface PopoverPosition {
  x: number;
  y: number;
}

interface HighlightColorPopoverProps {
  position: PopoverPosition;
  selectedText: string;
  onColorSelect: (color: HighlightColor) => void;
  onClose: () => void;
}

export function HighlightColorPopover(props: HighlightColorPopoverProps) {
  const { position, selectedText, onColorSelect, onClose } = props;
  const colors = getHighlightColors();

  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translateX(-50%)',
  };

  return (
    <div className="popover color-popover" style={popoverStyle} onClick={(e) => e.stopPropagation()}>
      <div className="color-popover-header">
        <div className="selected-text">
          "{selectedText}"
        </div>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className="color-buttons">
        {colors.map(color => (
          <button
            key={color}
            className={`color-button ${color}`}
            title={`Highlight with ${color}`}
            onClick={() => onColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );
} 