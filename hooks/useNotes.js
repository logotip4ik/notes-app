import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function useNotes() {
  const { data, error, mutate } = useSWR('/api/note', fetcher);

  return {
    notes: data || [],
    mutate,
    isError: !data && error,
    isLoading: !data && !error,
  };
}
