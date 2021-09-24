import styles from '../styles/NotesSidebar.module.scss';
import { useCallback } from 'react';
import { AnimateSharedLayout, motion } from 'framer-motion';
import NoteSidebarItem from './NotesSidebarItem';

const sorter = (aNote, bNote) =>
  new Date(bNote.updatedAt) - new Date(aNote.updatedAt);

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
      <AnimateSharedLayout>
        <motion.ul className={styles.main__list} layout>
          {notes.sort(sorter).map((note) => (
            <NoteSidebarItem
              key={note.id}
              note={note}
              currentNote={currentNote}
              onSelect={() => onSelectNote(note)}
              onDelete={() => onDeleteNote(note)}
            ></NoteSidebarItem>
          ))}
        </motion.ul>
      </AnimateSharedLayout>
    </div>
  );
}
