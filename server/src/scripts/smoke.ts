import { AddressInfo } from 'net';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/trainonex_smoke';
process.env.JWT_SECRET = 'smoke-test-jwt-secret-with-32-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.SERVER_URL = 'http://127.0.0.1:5000';
process.env.ADMIN_NAME = 'Smoke Admin';
process.env.ADMIN_EMAIL = 'admin@trainonex.com';
process.env.ADMIN_PASSWORD = 'SmokeTest123!';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.CLOUDINARY_API_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';

const jpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFRUVFRUVFRUVFRUVFRUWFxUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAIEBQYBB//EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A0wD/2Q==',
  'base64',
);

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const { app } = await import('../index');
  const { connectDb, disconnectDb } = await import('../config/db');
  const { ensureBaseline } = await import('../services/baseline');

  await connectDb();
  await mongoose.connection.dropDatabase();
  await ensureBaseline();

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  const base = `http://127.0.0.1:${port}`;

  const headers = { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' };

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers || {}) },
    });
    const body = await response.json();
    return { status: response.status, body };
  }

  const health = await request('/api/health');
  assert(health.status === 200, 'health failed');

  const hidden = await request('/api/admin/stats');
  assert(hidden.status === 401, `expected 401, got ${hidden.status}`);

  const blocked = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@trainonex.com', password: 'SmokeTest123!' }),
  });
  assert(blocked.status === 403, 'missing ajax header should be blocked');

  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@trainonex.com', password: 'wrong-password' }),
  });
  assert(badLogin.status === 401, 'bad password should be 401');

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@trainonex.com', password: 'SmokeTest123!' }),
  });
  assert(login.status === 200 && login.body.data.token, 'login failed');
  const token = login.body.data.token as string;
  const auth = { Authorization: `Bearer ${token}` };

  const categories = await request('/api/admin/categories', { headers: auth });
  assert(categories.status === 200 && categories.body.data.length >= 1, 'categories missing');
  const categoryId = categories.body.data[0]._id as string;

  const draftForm = new FormData();
  draftForm.set('title', 'Draft Harbor');
  draftForm.set('slug', 'draft-harbor');
  draftForm.set('shortDescription', 'A private case study that the public site must not show.');
  draftForm.set('description', 'This draft explains the work in enough detail to pass validation and stay hidden.');
  draftForm.set('category', categoryId);
  draftForm.set('technologies', JSON.stringify(['React', 'Node.js']));
  draftForm.set('status', 'draft');
  draftForm.set('projectUrl', '');
  draftForm.set('githubUrl', '');

  const draft = await fetch(`${base}/api/admin/projects`, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${token}` },
    body: draftForm,
  });
  const draftBody = await draft.json();
  assert(draft.status === 201, `draft create failed ${draft.status} ${JSON.stringify(draftBody)}`);

  const publicList = await request('/api/projects');
  assert(publicList.status === 200 && publicList.body.data.projects.length === 0, 'draft leaked to the public list');
  const hiddenSlug = await request('/api/projects/draft-harbor');
  assert(hiddenSlug.status === 404, 'draft slug should 404');

  const premature = await request(`/api/admin/projects/${draftBody.data._id}/status`, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ status: 'published' }),
  });
  assert(premature.status === 422, 'publish without thumbnail should fail');

  const liveForm = new FormData();
  liveForm.set('title', 'Northline');
  liveForm.set('slug', 'northline');
  liveForm.set('shortDescription', 'A published platform for operators who need a calmer daily view.');
  liveForm.set('description', 'Northline replaced a crowded dashboard with a quieter workflow.\n\nThe release shipped in three slices.');
  liveForm.set('category', categoryId);
  liveForm.set('technologies', JSON.stringify(['TypeScript', 'MongoDB']));
  liveForm.set('projectUrl', 'https://example.com');
  liveForm.set('githubUrl', '');
  liveForm.set('status', 'published');
  liveForm.set('thumbnail', new Blob([jpeg], { type: 'image/jpeg' }), 'thumb.jpg');

  const created = await fetch(`${base}/api/admin/projects`, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${token}` },
    body: liveForm,
  });
  const createdBody = await created.json();
  assert(created.status === 201, `published create failed ${created.status} ${JSON.stringify(createdBody)}`);

  const visible = await request('/api/projects');
  assert(visible.body.data.projects.length === 1, 'published project missing');
  assert(visible.body.data.projects[0].slug === 'northline', 'unexpected public slug');

  const detail = await request('/api/projects/northline');
  assert(detail.status === 200 && detail.body.data.title === 'Northline', 'detail page payload failed');

  const edited = new FormData();
  edited.set('title', 'Northline Revised');
  edited.set('slug', 'northline');
  edited.set('shortDescription', 'Updated summary that should replace the public case study.');
  edited.set('description', createdBody.data.description);
  edited.set('category', categoryId);
  edited.set('technologies', JSON.stringify(['TypeScript']));
  edited.set('projectUrl', 'https://example.com');
  edited.set('githubUrl', '');
  edited.set('status', 'published');
  edited.set('keepGallery', '[]');
  const update = await fetch(`${base}/api/admin/projects/${createdBody.data._id}`, {
    method: 'PUT',
    headers: { 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${token}` },
    body: edited,
  });
  const updateBody = await update.json();
  assert(update.status === 200, `update failed ${update.status} ${JSON.stringify(updateBody)}`);
  const revised = await request('/api/projects/northline');
  assert(revised.body.data.title === 'Northline Revised', 'public title did not update');

  const unpublished = await request(`/api/admin/projects/${createdBody.data._id}/status`, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({ status: 'draft' }),
  });
  assert(unpublished.status === 200, 'unpublish failed');
  const gone = await request('/api/projects/northline');
  assert(gone.status === 404, 'unpublished project still public');

  const contact = await request('/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Amina Cole',
      email: 'amina@example.com',
      company: 'Northwind',
      budget: '$10k–$25k',
      message: 'We need a calmer client portal and a realistic launch plan.',
      website: '',
    }),
  });
  assert(contact.status === 201, 'contact failed');

  const messages = await request('/api/admin/messages', { headers: auth });
  assert(messages.body.data.messages.length === 1, 'message was not stored');

  const removed = await request(`/api/admin/projects/${createdBody.data._id}`, { method: 'DELETE', headers: auth });
  assert(removed.status === 200, 'delete failed');

  const logout = await request('/api/auth/logout', { method: 'POST', headers: auth });
  assert(logout.status === 200, 'logout failed');

  console.log('Smoke test passed.');
  server.close();
  await mongoose.connection.dropDatabase();
  await disconnectDb();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
