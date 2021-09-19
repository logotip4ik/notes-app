import styles from '../styles/Home.module.css';
import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useNotes from '../hooks/useNotes';
import TagsSidebar from '../components/TagsSidebar';
import NotesSidebar from '../components/NotesSidebar';

const initialTags = [
  { id: 'all-notes', name: 'All Notes' },
  { id: 'favorites', name: 'Favorites' },
];

export default function Home({ user }) {
  const { notes, isLoading, isError, mutate } = useNotes();

  const [currentTag, setCurrentTag] = useState(initialTags[0]);
  const [currentNote, setCurrentNote] = useState(null);
  const tags = useMemo(() => {
    if (isLoading || !notes) return [];
    const res = new Set(initialTags);

    for (const note of notes) {
      if (note.tags.length !== 0) res.add(...note.tags);
    }

    return Array.from(res);
  }, [isLoading, notes]);
  const filteredNotes = useMemo(() => {
    if (isLoading) return [];
    if (currentTag.id === 'all-notes') return notes;
    const res = [];

    for (const note of notes)
      for (const tag of note.tags)
        if (tag.name === currentTag.name) return res.push(note);

    return res;
  }, [notes, currentTag, isLoading]);

  const addNewNote = useCallback(
    () =>
      mutate(async (cachedNotes) => {
        const res = await fetch('/api/note', {
          method: 'POST',
          body: JSON.stringify({ title: '', content: '' }),
        });
        const note = await res.json();
        setCurrentNote(note);

        return [...cachedNotes, note];
      }, false),
    [mutate],
  );

  useHotkeys('ctrl+alt+n', () => addNewNote(), [addNewNote]);

  if (isError) return <h1>You probably, should&quot;t see this, D_D</h1>;

  return (
    <>
      <Head>
        <title>Next Notes</title>
        <meta name="description" content="Your notes everywhere" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!isLoading && (
        <div className={styles.main}>
          <TagsSidebar
            tags={tags ? tags : []}
            currentTag={currentTag}
            onSelectTag={(tag) => setCurrentTag(tag)}
            onCreateNote={() => addNewNote()}
          ></TagsSidebar>
          <NotesSidebar
            notes={filteredNotes}
            currentNote={currentNote}
            onSelectNote={(note) => setCurrentNote(note)}
            onDeleteNote={() => {}}
          ></NotesSidebar>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });

  if (!session) return { redirect: { destination: '/login' } };

  return { props: { user: session.user } };
}
