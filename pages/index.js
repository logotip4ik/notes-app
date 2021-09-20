import '@uiw/react-textarea-code-editor/dist.css';
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import dynamic from 'next/dynamic';
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

const CodeEditor = dynamic(
  () => import('@uiw/react-textarea-code-editor').then((mod) => mod.default),
  { ssr: false },
);
const debounce = (callback, delay = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
};

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
  const codeValue = useMemo(() => {
    if (!currentNote) return '';
    return currentNote.content;
  }, [currentNote]);

  const addNewNote = useCallback(
    () =>
      mutate(async (cachedNotes) => {
        const res = await fetch('/api/note', {
          method: 'POST',
          body: JSON.stringify({ title: '', content: '' }),
        });
        const note = await res.json();
        setCurrentTag(initialTags[0]);
        setCurrentNote(note);

        return [...cachedNotes, note];
      }, false),
    [mutate],
  );
  const updateNote = useCallback(
    (note) => {
      mutate(async (cachedNotes) => {
        await fetch(`/api/note/${note.id}`, {
          method: 'POST',
          body: JSON.stringify(note),
        });

        const newNotes = cachedNotes.map((cachedNote) =>
          cachedNote.id === note.id ? note : cachedNote,
        );

        return newNotes;
      }, false);
    },
    [mutate],
  );

  useHotkeys('ctrl+alt+n', () => addNewNote(), [addNewNote]);

  if (isError) return <h1>You probably, should&apos;t see this, D_D</h1>;

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
            onSelectTag={(tag) => {
              setCurrentTag(tag);
              setCurrentNote(null);
            }}
            onCreateNote={() => addNewNote()}
          ></TagsSidebar>
          <NotesSidebar
            notes={filteredNotes}
            currentNote={currentNote}
            onSelectNote={(noteIdx) => setCurrentNote(noteIdx)}
            onDeleteNote={() => {}}
          ></NotesSidebar>
          <CodeEditor
            value={currentNote ? currentNote.content : ''}
            language="markdown"
            onChange={debounce(({ target }) =>
              updateNote({
                ...currentNote,
                title: target.value.split('\n')[0],
                content: target.value,
              }),
            )}
            style={{
              width: '100%',
              lineHeight: '1.75',
              fontSize: '16px',
              fontFamily: 'Consolas,Liberation Mono,Menlo,monospace',
            }}
            minHeight={80}
            placeholder="Enter your markdown"
            padding={15}
          ></CodeEditor>
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
