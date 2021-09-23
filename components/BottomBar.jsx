import { AnimatePresence, motion } from 'framer-motion';
import styles from '../styles/BottomBar.module.scss';

let initial = true;
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
  onDeleteNote,
  onSelectScratchPad,
  onToggleMarkdownPreview,
}) {
  return (
    <div className={styles.main}>
      <ul className={styles.main__list}>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']}`}
          onClick={onToggleMarkdownPreview}
          title="Toggle markdown preview"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enableBackground="new 0 0 24 24"
            viewBox="0 0 24 24"
          >
            <path d="M19,3H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.11,3,19,3z M19,19H5V7h14V19z M13.5,13 c0,0.83-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5c0-0.83,0.67-1.5,1.5-1.5S13.5,12.17,13.5,13z M12,9c-2.73,0-5.06,1.66-6,4 c0.94,2.34,3.27,4,6,4s5.06-1.66,6-4C17.06,10.66,14.73,9,12,9z M12,15.5c-1.38,0-2.5-1.12-2.5-2.5c0-1.38,1.12-2.5,2.5-2.5 c1.38,0,2.5,1.12,2.5,2.5C14.5,14.38,13.38,15.5,12,15.5z" />
          </svg>
        </li>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']}`}
          onClick={onSelectScratchPad}
          title="Show scratchpad"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enableBackground="new 0 0 24 24"
            viewBox="0 0 24 24"
          >
            <path d="M20.41,8.41l-4.83-4.83C15.21,3.21,14.7,3,14.17,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V9.83 C21,9.3,20.79,8.79,20.41,8.41z M7,7h7v2H7V7z M17,17H7v-2h10V17z M17,13H7v-2h10V13z" />
          </svg>
        </li>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']} ${styles['main__list__item--delete']}`}
          onClick={onDeleteNote}
          title="Delete current note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
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
