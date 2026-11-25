import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/errors';
import { cx, formatDate } from '@/lib/format';
import { deleteMessage, getMessages, markMessageRead } from '@/services/studio';
import type { ContactMessage, Pagination as PageInfo } from '@/types';

export function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<PageInfo>({ page: 1, limit: 8, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { notify } = useToast();

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const data = await getMessages(nextPage);
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(page);
    // Reload when the page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function openMessage(message: ContactMessage) {
    setOpenId((current) => (current === message._id ? '' : message._id));
    if (message.read) return;
    try {
      await markMessageRead(message._id);
      setMessages((current) => current.map((item) => (item._id === message._id ? { ...item, read: true } : item)));
    } catch (error) {
      notify('error', getErrorMessage(error));
    }
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await deleteMessage(pendingDelete._id);
      notify('success', result.message);
      setPendingDelete(null);
      const nextPage = messages.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (nextPage === page) await load(page);
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <Seo title="Messages — Trainonex studio" noIndex />
      <p className="text-xs uppercase tracking-[0.2em] text-stone">Inbox</p>
      <h1 className="mt-2 font-serif text-5xl">Messages</h1>
      <p className="mt-3 text-sm text-muted">Notes sent from the public contact form.</p>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="rounded-3xl border border-line bg-white px-5 py-8 text-sm text-muted">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-white px-5 py-12">
            <h2 className="font-serif text-3xl">The inbox is clear.</h2>
            <p className="mt-2 text-sm text-muted">New enquiries from the site will land here.</p>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message._id} className="rounded-3xl border border-line bg-white">
              <button type="button" className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left" onClick={() => void openMessage(message)}>
                <span>
                  <span className="flex items-center gap-2">
                    {!message.read && <span className="h-2 w-2 rounded-full bg-accent" aria-label="Unread" />}
                    <span className={cx('font-medium', !message.read && 'text-ink')}>{message.name}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {message.email}
                    {message.company ? ` · ${message.company}` : ''}
                    {message.budget ? ` · ${message.budget}` : ''}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-stone">{formatDate(message.createdAt)}</span>
              </button>
              {openId === message._id && (
                <div className="border-t border-line px-5 py-4">
                  <p className="whitespace-pre-line text-sm leading-6">{message.message}</p>
                  <div className="mt-4 flex gap-3">
                    <a className="text-sm text-accent-deep" href={`mailto:${message.email}`}>
                      Reply by email
                    </a>
                    <button type="button" className="text-sm text-danger" onClick={() => setPendingDelete(message)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <div className="mt-6">
        <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        body="The enquiry will be removed from the studio inbox."
        loading={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void onDelete()}
      />
    </div>
  );
}
