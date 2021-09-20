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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={styles.main__list__item__delete}
              onClick={() => onDeleteNote(note)}
            >
              <path d="M14.12 10.47L12 12.59l-2.13-2.12-1.41 1.41L10.59 14l-2.12 2.12 1.41 1.41L12 15.41l2.12 2.12 1.41-1.41L13.41 14l2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
