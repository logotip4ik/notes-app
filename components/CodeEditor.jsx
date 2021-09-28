import { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/scroll/scrollpastend';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/keymap/sublime';
import { functions as helperFunctions } from '../helpers';

const editorOptions = {
  lineNumbers: true,
  mode: 'markdown',
  scrollPastEnd: true,
  scrollbarStyle: 'simple',
  comment: true,
  smartIndent: true,
  keyMap: 'sublime',
  indentUnit: 2,
  tabSize: 2,
  theme: 'my-own-theme',
};

export default function CodeEditor({
  value,
  onChange,
  isVisible,
  CodeMirrorInstance,
}) {
  const editorRef = useRef();

  const emitChange = useMemo(
    () => helperFunctions.debounce((value) => onChange(value), 650),
    [onChange],
  );

  useEffect(
    () => (CodeMirrorInstance.current = editorRef.current.getCodeMirror()),
    [CodeMirrorInstance, editorRef],
  );
  useEffect(() => {
    setTimeout(editorRef.current.getCodeMirror().setValue(value), 0);
  }, [value, isVisible]);

  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={(code) => emitChange(code)}
        options={editorOptions}
      ></CodeMirror>
    </div>
  );
}