import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  Code,
  Heading,
  Eye,
  Edit3,
  RotateCcw
} from 'lucide-react';

export default function RichTextEditor({
  value = '',
  onChange,
  label = 'Description',
  placeholder = 'Write a detailed description, notes, specifications, or requirements...',
  rows = 4,
}) {
  const [isPreview, setIsPreview] = useState(false);

  const applyFormat = (syntaxBefore, syntaxAfter = '') => {
    const textarea = document.getElementById('rich-text-editor-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${syntaxBefore}${selectedText || 'text'}${syntaxAfter}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + (selectedText.length || 4));
    }, 50);
  };

  const handleBold = () => applyFormat('**', '**');
  const handleItalic = () => applyFormat('*', '*');
  const handleUnderline = () => applyFormat('<u>', '</u>');
  const handleList = () => applyFormat('\n- ');
  const handleCode = () => applyFormat('`', '`');
  const handleHeading = () => applyFormat('### ');

  const renderFormattedText = (text) => {
    if (!text) return <span className="text-slate-400 italic">No description provided.</span>;

    // Convert simple markdown/HTML formatting for preview
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono">$1</code>')
      .replace(/### (.*?)\n/g, '<h3 class="text-sm font-bold text-indigo-400 my-1">$1</h3>')
      .replace(/\n- (.*?)/g, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: formatted }} className="text-xs space-y-1 leading-relaxed" />;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}

        {/* Preview / Edit Mode Switcher Button */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
        >
          {isPreview ? (
            <>
              <Edit3 className="w-3 h-3" /> Edit Text
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" /> Live Preview
            </>
          )}
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
        {/* Formatting Toolbar */}
        {!isPreview && (
          <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 text-slate-400">
            <button
              type="button"
              onClick={handleBold}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleItalic}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleUnderline}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1"></div>
            <button
              type="button"
              onClick={handleHeading}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
              title="Heading (### Header)"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleList}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
              title="Bullet List (- item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCode}
              className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded hover:bg-rose-950/40 hover:text-rose-400 transition ml-auto"
              title="Clear Text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Textarea or Preview Body */}
        {isPreview ? (
          <div className="p-3.5 text-xs text-slate-200 min-h-[100px] bg-slate-900/50">
            {renderFormattedText(value)}
          </div>
        ) : (
          <textarea
            id="rich-text-editor-textarea"
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans"
          ></textarea>
        )}
      </div>
    </div>
  );
}
