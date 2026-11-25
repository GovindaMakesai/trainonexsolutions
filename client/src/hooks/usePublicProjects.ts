import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { getCategories, getPublishedProjects } from '@/services/projects';
import type { Category, Project } from '@/types';

export function usePublicProjects() {
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPage: number, nextCategory: string, append: boolean, silent = false) => {
    if (append) setLoadingMore(true);
    else if (!silent) setLoading(true);
    if (!silent) setError('');
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: '9' });
      if (nextCategory !== 'all') params.set('category', nextCategory);
      const data = await getPublishedProjects(params);
      setProjects((current) => (append ? [...current, ...data.projects] : data.projects));
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
      setError('');
    } catch (err) {
      if (!append && !silent) setProjects([]);
      setError(getErrorMessage(err, 'We couldn’t load the work.'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    void load(1, category, false);
  }, [category, load]);

  useEffect(() => {
    const onFocus = () => {
      void load(1, category, false, true);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [category, load]);

  return {
    category,
    setCategory,
    categories,
    projects,
    total,
    loading,
    loadingMore,
    error,
    hasMore: page < pages,
    reload: () => load(1, category, false),
    loadMore: () => load(page + 1, category, true),
  };
}
