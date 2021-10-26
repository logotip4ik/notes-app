import { useMemo } from 'react';
import TextareaEditor from '@uiw/react-textarea-code-editor';
import { functions as helperFunctions } from '../helpers';

export default function CodeEditor({ value, onChange, isVisible }) {
  const emitChange = useMemo(
    () => helperFunctions.debounce((value) => onChange(value), 650),
    [onChange],
  );

  return (
    <div
      style={
        !isVisible
          ? { position: 'absolute', left: '100%', width: 0, height: 0 }
          : {}
      }
    >
      <TextareaEditor
        value={value}
        language="markdown"
        onChange={({ target }) => emitChange(target.value)}
        style={{
          display: 'inline-block',
          fontSize: 16,
          fontFamily:
            "'Operator Mono', 'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace",
        }}
      ></TextareaEditor>
    </div>
  );
}
