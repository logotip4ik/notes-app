import styles from '../styles/NotesSidebar.module.scss';
import { useCallback } from 'react';

export default function NotesSidebar({
  notes,
  currentNote,
  onSelectNote,
  onDeleteNote,
}) {
  const formatDate = useCallback(
    (date) =>
      Intl.DateTimeFormat('ua', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(date)),
    [],
  );

  return (
    <div className={styles.main}>
      <div className={styles.main__wrapper}>
        <input
          type="text"
          placeholder="Search with note title"
          className={styles.main__wrapper__input}
        />
      </div>
      <ul className={styles.main__list}>
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`${styles.main__list__item} ${
              currentNote && currentNote.id === note.id
                ? styles['main__list__item--selected']
                : ''
            }`}
          >
            <h2 className={styles.main__list__item__heading}>
              {note.title || 'New Note'}
            </h2>
            <small className={styles.main__list__item__createdAt}>
              {formatDate(note.createdAt)}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
