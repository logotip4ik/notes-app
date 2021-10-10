import 'prismjs/themes/prism-okaidia.css';
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import marked from 'marked';
import DOMPurify from 'dompurify';
import prism from 'prismjs';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-bash';
import useNotes from '../hooks/useNotes';
import { constants } from '../helpers';
import BottomBar from '../components/BottomBar';
import TagsSidebar from '../components/TagsSidebar';
import NotesSidebar from '../components/NotesSidebar';

const CodeEditor = dynamic(() => import('../components/CodeEditor'), {
  ssr: false,
});

const filters = {
  all: ({ notes }) => notes,
  search: ({ notes, searchQuery }) =>
    notes.filter((note) => note.title.includes(searchQuery)),
  tag: ({ notes, tag }) => {
    const res = [];

    for (const note of notes)
      for (const noteTag of note.tags)
        if (noteTag.name === tag.name) res.push(note);

    return res;
  },
};
// FIXME: refactor the tags api
// COMMENT: create a separate api route for tags, cuz you need to be able to create them not only update or link
// COMMENT: then probably fetch them the same as notes D_D
export default function Home({ user }) {
  const { notes, isLoading, isError, mutate } = useNotes();

  const [currentTag, setCurrentTag] = useState(constants.initialTags[0]);
  const [currentNote, setCurrentNote] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewingMarkdown, setIsViewingMarkdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const tags = useMemo(() => {
    if (isLoading || !notes) return [];
    const res = new Set(constants.initialTags);

    for (const note of notes) {
      const normalizedTags = note.tags.map((tag) =>
        tag.name === constants.initialTags[1].id
          ? constants.initialTags[1]
          : tag,
      );
      if (note.tags.length !== 0) res.add(...normalizedTags);
    }

    return Array.from(res);
  }, [isLoading, notes]);

  const compileMarkdown = useCallback((markdown) => {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName !== 'A') return;

      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    });

    const html = marked(markdown, {
      gfm: true,
      highlight: (code, lang) => {
        if (prism.languages[lang])
          return prism.highlight(code, prism.languages[lang], lang);
        return code;
      },
    });

    setMarkdown(DOMPurify.sanitize(html));
  }, []);

  const showScratchPad = useCallback(() => {
    setCurrentNote(null);
    const scratchpad = localStorage.getItem(constants.scratchpadRef);
    if (!scratchpad) return;
    try {
      setCurrentNote(JSON.parse(scratchpad));
    } catch (err) {}
  }, []);

  const addNewNote = useCallback(() => {
    setIsSyncing(true);
    setIsViewingMarkdown(false);

    // Boilerplate note, just for faster creation, no need for waiting for the server response
    const newNote = {
      id: (Math.random() * 10000) << 0,
      title: '',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shouldReAddSelf: true,
    };

    setCurrentTag(constants.initialTags[0]);
    setCurrentNote(newNote);
    mutate((cachedNotes) => [...cachedNotes, newNote], false);

    fetch('/api/note', {
      method: 'POST',
      body: JSON.stringify({ title: '', content: '' }),
    })
      .then((res) => res.json())
      .then((noteFromServer) =>
        mutate((cachedNotes) => {
          setIsSyncing(false);
          setCurrentNote(noteFromServer);
          return cachedNotes.map((note) =>
            note.shouldReAddSelf ? noteFromServer : note,
          );
        }, true),
      );
  }, [mutate]);

  const updateNote = useCallback(
    (note) => {
      compileMarkdown(note.content);

      if (!note.id)
        return localStorage.setItem(
          constants.scratchpadRef,
          JSON.stringify(note),
        );

      setIsSyncing(true);
      mutate(async (cachedNotes) => {
        fetch(`/api/note/${note.id}`, {
          method: 'POST',
          body: JSON.stringify(note),
        }).then(() => setIsSyncing(false));

        const newNotes = cachedNotes.map((cachedNote) =>
          cachedNote.id === note.id
            ? { ...note, updatedAt: new Date() }
            : cachedNote,
        );

        return newNotes;
      }, false);
    },
    [mutate, compileMarkdown],
  );
  const updateTagsOnNote = useCallback(
    (note, tagName, deleteTag = false) => {
      const normalizedUrlTagName = tagName.toLowerCase().replace(/ /g, '-');

      if (!deleteTag)
        setCurrentNote({
          ...note,
          tags: [
            ...note.tags,
            {
              id: (Math.random() * 1000) << 0,
              name: constants.initialTags[1].id,
            },
          ],
        });
      else
        setCurrentNote({
          ...note,
          tags: note.tags.filter(
            (tag) => tag.name !== constants.initialTags[1].id,
          ),
        });

      mutate(async (cachedNotes) => {
        const res = await fetch(
          `/api/note/${note.id}/${normalizedUrlTagName}`,
          { method: deleteTag ? 'DELETE' : 'POST' },
        );
        const updatedNote = await res.json();
        return cachedNotes.map((cachedNote) =>
          cachedNote.id === note.id ? updatedNote : cachedNote,
        );
      }, false);
    },
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
  useEffect(
    () => (currentNote ? compileMarkdown(currentNote.content) : null),
    [currentNote, compileMarkdown],
  );

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
              setSearchQuery('');
              setCurrentNote(null);
            }}
            onCreateNote={() => addNewNote()}
          ></TagsSidebar>
          <NotesSidebar
            notes={filters[
              currentTag && currentTag.id !== 'all-notes'
                ? 'tag'
                : searchQuery
                ? 'search'
                : 'all'
            ]({ notes, searchQuery, tag: currentTag })}
            search={searchQuery}
            currentNote={currentNote}
            onSelectNote={(note) => setCurrentNote(note)}
            onDeleteNote={(note) => deleteNote(note)}
            onSearchChange={(noteTitle) => setSearchQuery(noteTitle)}
          ></NotesSidebar>
          <div className={styles.main__editors}>
            <div>
              <div
                style={{
                  display: isViewingMarkdown ? 'block' : 'none',
                }}
                className="marked-block"
                dangerouslySetInnerHTML={{ __html: markdown }}
              ></div>
              <CodeEditor
                value={currentNote?.content || ''}
                onChange={(code) =>
                  updateNote({
                    ...currentNote,
                    title: code.split('\n')[0],
                    content: code,
                  })
                }
                isVisible={!isViewingMarkdown}
              ></CodeEditor>
            </div>
            <BottomBar
              isSyncing={isSyncing}
              currentNote={currentNote}
              user={user}
              onRemoveFromFav={() =>
                currentNote.id
                  ? updateTagsOnNote(
                      currentNote,
                      constants.initialTags[1].id,
                      true,
                    )
                  : 'none'
              }
              onAddToFav={() =>
                currentNote.id
                  ? updateTagsOnNote(currentNote, constants.initialTags[1].id)
                  : 'none'
              }
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
