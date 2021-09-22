import { useMemo } from 'react';
import styles from '../styles/BottomBar.module.scss';

let initial = true;

export default function BottomBar({
  user,
  isSyncing,
  onToggleMarkdownPreview,
}) {
  const lastlySyncedText = useMemo(() => {
    const currentTime = new Intl.DateTimeFormat('ua', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date());
    let res = 'In Sync';

    if (!initial && isSyncing) res = 'Syncing';
    if (!initial && !isSyncing) res = `Synced ${currentTime}`;

    initial = false;

    return res;
  }, [isSyncing]);

  return (
    <div className={styles.main}>
      <ul className={styles.main__list}>
        <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']}`}
          onClick={onToggleMarkdownPreview}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enableBackground="new 0 0 24 24"
            viewBox="0 0 24 24"
          >
            <path d="M19,3H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.11,3,19,3z M19,19H5V7h14V19z M13.5,13 c0,0.83-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5c0-0.83,0.67-1.5,1.5-1.5S13.5,12.17,13.5,13z M12,9c-2.73,0-5.06,1.66-6,4 c0.94,2.34,3.27,4,6,4s5.06-1.66,6-4C17.06,10.66,14.73,9,12,9z M12,15.5c-1.38,0-2.5-1.12-2.5-2.5c0-1.38,1.12-2.5,2.5-2.5 c1.38,0,2.5,1.12,2.5,2.5C14.5,14.38,13.38,15.5,12,15.5z" />
          </svg>
        </li>
        {/* <li
          className={`${styles.main__list__item} ${styles['main__list__item--svg']} ${styles['main__list__item--delete']}`}
        >
          TODO: add svg delete
        </li> */}
      </ul>
      <ul className={styles.main__list}>
        <li
          className={`${styles.main__list__item} ${
            isSyncing
              ? styles['main__list__item--syncing']
              : styles['main__list__item--in-sync']
          }`}
        >
          {lastlySyncedText}
        </li>
      </ul>
    </div>
  );
}
