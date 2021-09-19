import styles from '../styles/NotesSidebar.module.scss';
import { useCallback } from 'react';

export default function NotesSidebar({
  notes,
  currentNote,
  onSelectNote,
  onDeleteNote,
}) {
  const getSmallText = useCallback((text) => `${text.slice(0, 15)}...`, []);

  return (
    <ul className={styles.list}>
      {notes.map((note) => (
        <li
          key={note.id}
          onClick={onSelectNote}
          className={`${styles.list__item} ${
            currentNote.id === note.id ? styles['list__item--selected'] : ''
          }`}
        >
          <h2>{note.title}</h2>
          <small>{getSmallText(note.content)}</small>
        </li>
      ))}
    </ul>
  );
}
