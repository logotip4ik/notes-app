import styles from '../styles/NotesSidebarItem.module.scss';
import { motion, usePresence } from 'framer-motion';

const formatDate = (date) =>
  Intl.DateTimeFormat('ua', { dateStyle: 'medium' }).format(new Date(date));

export default function NoteSidebarItem({
  note,
  currentNote,
  onSelect,
  onDelete,
}) {
  const [isPresent, safeToRemove] = usePresence();

  const animations = {
    layout: true,
    initial: 'out',
    exit: 'out',
    animate: isPresent ? 'in' : 'out',
    whileTap: 'tapped',
    variants: {
      in: { opacity: 1 },
      out: { opacity: 0 },
      tapped: { scale: 0.99 },
    },
    onAnimationComplete: () => !isPresent && safeToRemove(),
    transition: { type: 'spring', stiffness: 500, damping: 50, mass: 1 },
  };

  return (
    <motion.li
      {...animations}
      onClick={() => onSelect(note)}
      className={`${styles.item} ${
        currentNote && note.id === currentNote.id
          ? styles['item--selected']
          : ''
      }`}
    >
      <h2 className={styles.item__heading}>{note.title || 'New Note'}</h2>
      <small className={styles.item__createdAt}>
        {formatDate(note.createdAt)}
      </small>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={styles.item__delete}
        onClick={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          onDelete(note);
        }}
      >
        <path d="M14.12 10.47L12 12.59l-2.13-2.12-1.41 1.41L10.59 14l-2.12 2.12 1.41 1.41L12 15.41l2.12 2.12 1.41-1.41L13.41 14l2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
      </svg>
    </motion.li>
  );
}
