import '@uiw/react-textarea-code-editor/dist.css';
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import marked from 'marked';
import DOMPurify from 'dompurify';
import useNotes from '../hooks/useNotes';
import { constants, functions } from '../helpers';
import BottomBar from '../components/BottomBar';
import TagsSidebar from '../components/TagsSidebar';
import NotesSidebar from '../components/NotesSidebar';

const CodeEditor = dynamic(
  () => import('@uiw/react-textarea-code-editor').then((mod) => mod.default),
  { ssr: false },
);

export default function Home({ user }) {
  const { notes, isLoading, isError, mutate } = useNotes();

  const [currentTag, setCurrentTag] = useState(constants.initialTags[0]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isViewingMarkdown, setIsViewingMarkdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const tags = useMemo(() => {
    if (isLoading || !notes) return [];
    const res = new Set(constants.initialTags);

    for (const note of notes) {
      if (note.tags.length !== 0) res.add(...note.tags);
    }

    return Array.from(res);
  }, [isLoading, notes]);
  const filteredNotes = useMemo(() => {
    if (isLoading) return [];
    if (currentTag.id === 'all-notes')
      return notes.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    const res = [];

    for (const note of notes)
      for (const tag of note.tags)
        if (tag.name === currentTag.name) return res.push(note);

    return res.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, currentTag, isLoading]);
  const compiledMarkdown = useMemo(() => {
    if (!currentNote) return '';
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName !== 'A') return;

      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    });

    const html = marked(currentNote.content, {
      gfm: true,
    });
    return DOMPurify.sanitize(html);
  }, [currentNote]);

  const showScratchPad = useCallback(() => {
    setCurrentNote(null);
    const scratchpad = localStorage.getItem(constants.scratchpadRef);
    if (!scratchpad) return;
    try {
      setCurrentNote(JSON.parse(scratchpad));
    } catch (err) {}
  }, []);
  const addNewNote = useCallback(
    () =>
      mutate(async (cachedNotes) => {
        setIsSyncing(true);
        const res = await fetch('/api/note', {
          method: 'POST',
          body: JSON.stringify({ title: '', content: '' }),
        });
        const note = await res.json();
        setCurrentTag(constants.initialTags[0]);
        setCurrentNote(note);

        const editor = document.querySelector('[data-editor]');
        if (editor) editor.focus();

        setIsSyncing(false);
        return [...cachedNotes, note];
      }, false),
    [mutate],
  );
  // eslint-disable-next-line
  const updateNote = useCallback(
    functions.debounce((note) => {
      setCurrentNote(note);
      if (!note.id)
        return localStorage.setItem(
          constants.scratchpadRef,
          JSON.stringify(note),
        );
      setIsSyncing(true);
      mutate(async (cachedNotes) => {
        await fetch(`/api/note/${note.id}`, {
          method: 'POST',
          body: JSON.stringify(note),
        });

        const newNotes = cachedNotes.map((cachedNote) =>
          cachedNote.id === note.id ? note : cachedNote,
        );

        setIsSyncing(false);

        return newNotes;
      }, false);
    }),
    [mutate],
  );
  const deleteNote = useCallback(
    (note) => {
      showScratchPad();
      const newNotes = notes.reduce(
        (acc, cachedNote) =>
          cachedNote.id !== note.id ? [...acc, cachedNote] : acc,
        [],
      );
      mutate(newNotes, false);
      fetch(`/api/note/${note.id}`, { method: 'DELETE' }).then((res) => res.ok);
    },
    [mutate, notes, showScratchPad],
  );

  useHotkeys('ctrl+alt+n', () => addNewNote(), {
    enableOnTags: ['TEXTAREA'],
  });
  useHotkeys('ctrl+alt+j', () => setIsViewingMarkdown((bool) => !bool), {
    enableOnTags: ['TEXTAREA'],
  });

  // eslint-disable-next-line
  useEffect(showScratchPad, []);

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
            onSelectNote={(note) => setCurrentNote(note)}
            onDeleteNote={(note) => deleteNote(note)}
          ></NotesSidebar>
          <div className={styles.main__editors}>
            <div>
              <div
                style={{
                  display: isViewingMarkdown ? 'block' : 'none',
                }}
                className="marked-block"
                dangerouslySetInnerHTML={{ __html: compiledMarkdown }}
              ></div>
              <CodeEditor
                value={currentNote?.content || ''}
                language="markdown"
                onChange={({ target }) =>
                  updateNote({
                    ...currentNote,
                    title: target.value.split('\n')[0],
                    content: target.value,
                  })
                }
                style={{
                  display: isViewingMarkdown ? 'none' : 'block',
                  fontSize: '16px',
                  fontFamily: 'Consolas,Liberation Mono,Menlo,monospace',
                }}
                minHeight={40}
                placeholder="Enter your markdown"
                padding={15}
                data-editor
              ></CodeEditor>
            </div>
            <BottomBar
              isSyncing={isSyncing}
              user={user}
              onToggleMarkdownPreview={() =>
                setIsViewingMarkdown((bool) => !bool)
              }
              onSelectScratchPad={() => showScratchPad()}
              onDeleteNote={() => deleteNote(currentNote)}
            ></BottomBar>
          </div>
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
