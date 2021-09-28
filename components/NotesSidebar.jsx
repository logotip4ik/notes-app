import styles from '../styles/NotesSidebar.module.scss';
import { useCallback } from 'react';
import { AnimateSharedLayout, motion } from 'framer-motion';
import NoteSidebarItem from './NotesSidebarItem';

const sorter = (aNote, bNote) =>
  new Date(bNote.updatedAt) - new Date(aNote.updatedAt);

export default function NotesSidebar({
  notes,
  search,
  currentNote,
  onSelectNote,
  onDeleteNote,
  onSearchChange,
}) {
  return (
    <div className={styles.main}>
      <div className={styles.main__wrapper}>
        <input
          type="text"
          placeholder="Search with note title"
          className={styles.main__wrapper__input}
          value={search}
          onChange={({ target }) => onSearchChange(target.value)}
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
