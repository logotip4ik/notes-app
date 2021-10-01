import styles from '../styles/TagsSidebar.module.scss';
import Plus from '../assets/plus.svg';

const toTitleCase = (str) =>
  str
    .split('')
    .map((char, i) => (i === 0 ? char.toUpperCase() : char))
    .join('')
    .replace(/-/g, ' ');

export default function TagsSidebar({
  tags,
  currentTag,
  onCreateNote,
  onSelectTag,
}) {
  return (
    <div className={styles.sidebar}>
      <button className={styles.sidebar__createButton} onClick={onCreateNote}>
        <Plus></Plus>
        Note
      </button>
      <h1 className={styles.sidebar__heading}>Tags:</h1>
      <ul className={styles.sidebar__list}>
        {tags.map((tag) => (
          <li
            className={`${styles.sidebar__list__item} ${
              currentTag.id === tag.id
                ? styles['sidebar__list__item--selected']
                : ''
            }`}
            key={tag.id}
            onClick={() => onSelectTag(tag)}
          >
            {toTitleCase(tag.name)}
          </li>
        ))}
      </ul>
    </div>
  );
}
