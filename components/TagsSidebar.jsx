import styles from '../styles/TagsSidebar.module.scss';
export default function TagsSidebar({
  tags,
  currentTag,
  onCreateNote,
  onSelectTag,
}) {
  return (
    <div className={styles.sidebar}>
      <button className={styles.sidebar__createButton} onClick={onCreateNote}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
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
            {tag.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
