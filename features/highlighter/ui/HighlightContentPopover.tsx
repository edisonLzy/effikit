import React, { useState, useCallback } from 'react';
import type { Highlight, HighlightTag, TagType, AnnotationTagContent, WordTagContent, SentenceTagContent, TagContent } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

// 这是一个临时的管理器存根，后续需要替换为真实的管理器调用
const highlightManager = {
  async updateTagContent(highlightId: string, tagId: string, content: Partial<TagContent>) {
    console.log('Updating tag', { highlightId, tagId, content });
  },
  async addTagToHighlight(highlightId: string, type: TagType) {
    console.log('Adding tag', { highlightId, type });
  },
  async setActiveTag(highlightId: string, tagId: string) {
    console.log('Setting active tag', { highlightId, tagId });
  },
  async deleteTag(highlightId: string, tagId: string) {
    console.log('Deleting tag', { highlightId, tagId });
  }
};

interface HighlightContentPopoverProps {
  highlight: Highlight;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (updatedHighlight: Highlight) => void;
}

export function HighlightContentPopover({ highlight: initialHighlight, position, onClose, onUpdate }: HighlightContentPopoverProps) {
  const [highlight, setHighlight] = useState(initialHighlight);
  const [activeTagId, setActiveTagId] = useState(highlight.tags.find(t => t.isActive)?.id || (highlight.tags.length > 0 ? highlight.tags[0].id : null));

  const handleSetActiveTag = useCallback(async (tagId: string) => {
    setActiveTagId(tagId);
    await highlightManager.setActiveTag(highlight.id, tagId);
  }, [highlight.id]);

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  const activeTag = highlight.tags.find(tag => tag.id === activeTagId);

  return (
    <div className="popover content-popover" style={popoverStyle} onClick={e => e.stopPropagation()}>
      <style>
        {`
          .content-popover {
            width: 320px;
            max-height: 400px;
            display: flex;
            flex-direction: column;
          }
          
          .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          
          .content-title {
            font-size: 12px;
            color: #666;
            max-width: 220px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .close-button {
            font-size: 18px;
            color: #999;
            padding: 4px;
            line-height: 1;
          }
          
          .close-button:hover {
            color: #666;
          }
          
          .tabs-container {
            display: flex;
            border-bottom: 1px solid #eee;
            padding: 0 8px;
            background: #f8f9fa;
          }
          
          .tab-button {
            padding: 8px 12px;
            font-size: 14px;
            border-bottom: 2px solid transparent;
            color: #666;
            transition: all 0.2s ease;
          }
          
          .tab-button.active {
            border-bottom-color: #007bff;
            color: #007bff;
            font-weight: 500;
          }
          
          .tab-button:hover {
            color: #007bff;
            background: rgba(0, 123, 255, 0.05);
          }
          
          .add-tab-button {
            padding: 8px;
            font-size: 16px;
            color: #999;
            margin-left: auto;
          }
          
          .add-tab-button:hover {
            color: #007bff;
          }
          
          .content-body {
            padding: 12px;
            flex: 1;
            overflow-y: auto;
          }
          
          .no-tags {
            text-align: center;
            color: #999;
            font-style: italic;
          }
          
          .annotation-editor {
            width: 100%;
            min-height: 100px;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            resize: vertical;
            font-family: inherit;
            font-size: 14px;
          }
          
          .word-viewer {
            line-height: 1.6;
          }
          
          .word-phonetic {
            font-size: 16px;
            color: #555;
            margin-bottom: 4px;
          }
          
          .word-pos {
            font-size: 12px;
            color: #777;
            font-style: italic;
            margin-bottom: 8px;
          }
          
          .word-definitions {
            padding-left: 20px;
            margin: 0;
          }
          
          .word-definitions li {
            margin-bottom: 4px;
            font-size: 14px;
          }
          
          .sentence-viewer {
            text-align: center;
            color: #999;
            font-style: italic;
          }
        `}
      </style>
      
      <Header text={highlight.text} onClose={onClose} />
      
      <div className="tabs-container">
        {highlight.tags.map(tag => (
          <TabButton key={tag.id} tag={tag} isActive={tag.id === activeTagId} onClick={() => handleSetActiveTag(tag.id)} />
        ))}
        <button className="add-tab-button">+</button>
      </div>
      
      <div className="content-body">
        {activeTag ? (
          <TagContentRenderer tag={activeTag} highlightId={highlight.id} />
        ) : (
          <div className="no-tags">没有可用的标签。</div>
        )}
      </div>
    </div>
  );
}

// ========== 子组件 ==========

function Header({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="content-header">
      <div className="content-title">
        "{text}"
      </div>
      <button className="close-button" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function TabButton({ tag, isActive, onClick }: { tag: HighlightTag; isActive: boolean; onClick: () => void }) {
  return (
    <button 
      className={`tab-button ${isActive ? 'active' : ''}`} 
      onClick={onClick}
    >
      {tag.title}
    </button>
  );
}

function TagContentRenderer({ tag, highlightId }: { tag: HighlightTag; highlightId: string }) {
  switch (tag.type) {
    case 'annotation':
      return <AnnotationEditor content={tag.content as AnnotationTagContent} tagId={tag.id} highlightId={highlightId} />;
    case 'word':
      return <WordViewer content={tag.content as WordTagContent} />;
    case 'sentence':
      return <SentenceViewer content={tag.content as SentenceTagContent} />;
    default:
      return <div>未知标签类型。</div>;
  }
}

function AnnotationEditor({ content, tagId, highlightId }: { content: AnnotationTagContent, tagId: string, highlightId: string }) {
  const [note, setNote] = useState(content.note);
  const debouncedNote = useDebounce(note, 500);

  React.useEffect(() => {
    if (debouncedNote !== content.note) {
      highlightManager.updateTagContent(highlightId, tagId, { ...content, note: debouncedNote, updatedAt: Date.now() });
    }
  }, [debouncedNote, content, tagId, highlightId]);

  return (
    <textarea
      className="annotation-editor"
      value={note}
      onChange={e => setNote(e.target.value)}
      placeholder="添加你的批注..."
    />
  );
}

function WordViewer({ content }: { content: WordTagContent }) {
  return (
    <div className="word-viewer">
      {content.phonetic && <div className="word-phonetic">/{content.phonetic}/</div>}
      {content.partOfSpeech && <div className="word-pos">{content.partOfSpeech}</div>}
      <ul className="word-definitions">
        {content.definitions.map((def, i) => <li key={i}>{def}</li>)}
      </ul>
    </div>
  );
}

function SentenceViewer({ content }: { content: SentenceTagContent }) {
  return <div className="sentence-viewer">句子分析功能即将推出。</div>;
} 