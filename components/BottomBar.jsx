import styles from '../styles/BottomBar.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { constants } from '../helpers';
import ToggleMarkdownPreview from '../assets/preview.svg';
import TextSnippet from '../assets/text-snippet.svg';
import Delete from '../assets/delete.svg';

const getCurrentTime = () =>
  new Intl.DateTimeFormat('ua', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());

const animate = { opacity: 1 };
const exit = { opacity: 0 };

export default function BottomBar({
  user,
  isSyncing,
  currentNote,
  onAddToFav,
  onDeleteNote,
  onRemoveFromFav,
  onSelectScratchPad,
  onToggleMarkdownPreview,
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    if (!currentNote || !currentNote.tags) return;
    setIsFavorite(
      currentNote.tags.some((tag) => tag.name === constants.initialTags[1].id),
    );
  }, [currentNote]);

  return (
    <div className={styles.main}>
      <ul className={styles.main__list}>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']}`}
          onClick={onToggleMarkdownPreview}
          title="Toggle markdown preview"
        >
          <ToggleMarkdownPreview></ToggleMarkdownPreview>
        </li>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']}`}
          onClick={onSelectScratchPad}
          title="Show scratchpad"
        >
          <TextSnippet></TextSnippet>
        </li>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']} ${styles['main__list__item--star']}`}
          onClick={isFavorite ? onRemoveFromFav : onAddToFav}
          title="Add to favorites"
        >
          <AnimatePresence exitBeforeEnter>
            {isFavorite ? (
              <motion.svg
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                key="1"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </motion.svg>
            ) : (
              <motion.svg
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                key="2"
              >
                <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </li>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']} ${styles['main__list__item--delete']}`}
          onClick={onDeleteNote}
          title="Delete current note"
        >
          <Delete></Delete>
        </li>
      </ul>
      <ul className={styles.main__list}>
        <li
          className={`${styles.main__list__item} ${
            isSyncing
              ? styles['main__list__item--syncing']
              : styles['main__list__item--in-sync']
          }`}
        >
          <AnimatePresence exitBeforeEnter>
            {isSyncing ? (
              <motion.span
                key={1}
                initial={exit}
                animate={animate}
                exit={exit}
                transition={{ duration: 0.4 }}
              >
                Syncing{' '}
              </motion.span>
            ) : (
              <motion.span
                key={2}
                initial={exit}
                animate={animate}
                exit={exit}
                transition={{ duration: 0.4 }}
              >
                Synced {getCurrentTime()}{' '}
              </motion.span>
            )}
          </AnimatePresence>
        </li>
      </ul>
    </div>
  );
}
