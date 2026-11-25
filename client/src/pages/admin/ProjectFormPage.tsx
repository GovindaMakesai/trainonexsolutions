import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, fieldClass } from '@/components/ui/Field';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage, getFieldErrors, isHttpUrl } from '@/lib/errors';
import { slugify } from '@/lib/format';
import { getAdminProject, getCategories, saveProject } from '@/services/projects';
import type { Category, ImageAsset, Project } from '@/types';

type Status = Project['status'];

type FormState = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  technologies: string[];
  projectUrl: string;
  githubUrl: string;
  status: Status;
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  category: '',
  technologies: [],
  projectUrl: '',
  githubUrl: '',
  status: 'draft',
};

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function validate(values: FormState, hasThumbnail: boolean) {
  const errors: Record<string, string> = {};
  if (values.title.trim().length < 3 || values.title.trim().length > 120) errors.title = 'Title must be between 3 and 120 characters.';
  if (values.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = 'Use lowercase letters, numbers, and hyphens.';
  }
  if (values.shortDescription.trim().length < 10 || values.shortDescription.trim().length > 300) {
    errors.shortDescription = 'Short description must be between 10 and 300 characters.';
  }
  if (values.description.trim().length < 20) errors.description = 'Case study must be at least 20 characters.';
  if (!values.category) errors.category = 'Choose a category.';
  if (!isHttpUrl(values.projectUrl.trim())) errors.projectUrl = 'Enter a full URL starting with http:// or https://.';
  if (!isHttpUrl(values.githubUrl.trim())) errors.githubUrl = 'Enter a full URL starting with http:// or https://.';
  if (values.status === 'published' && !hasThumbnail) errors.thumbnail = 'Add a thumbnail before publishing.';
  return errors;
}

function acceptImages(files: File[]) {
  const accepted: File[] = [];
  const problems: string[] = [];
  files.forEach((file) => {
    if (!ALLOWED.includes(file.type)) {
      problems.push(`${file.name} must be a JPEG, PNG, WebP, or GIF.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      problems.push(`${file.name} is larger than 5MB.`);
      return;
    }
    accepted.push(file);
  });
  return { accepted, problems };
}

export function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [techDraft, setTechDraft] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [existingThumbnail, setExistingThumbnail] = useState<ImageAsset | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<ImageAsset[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => notify('error', 'Categories could not be loaded.'))
      .finally(() => setCategoriesLoaded(true));
  }, [notify]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getAdminProject(id)
      .then((project) => {
        if (!active) return;
        const categoryId = typeof project.category === 'string' ? project.category : project.category._id;
        setForm({
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          description: project.description,
          category: categoryId,
          technologies: project.technologies || [],
          projectUrl: project.projectUrl || '',
          githubUrl: project.githubUrl || '',
          status: project.status,
        });
        setSlugTouched(true);
        setExistingThumbnail(project.thumbnail || null);
        setExistingGallery(project.gallery || []);
      })
      .catch((error) => notify('error', getErrorMessage(error)))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, notify]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview('');
      return;
    }
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  useEffect(() => {
    const urls = galleryFiles.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  }

  function addTechnologies(raw: string) {
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return;
    setForm((current) => {
      const technologies = [...current.technologies];
      parts.forEach((part) => {
        if (technologies.length >= 12) return;
        if (technologies.some((item) => item.toLowerCase() === part.toLowerCase())) return;
        technologies.push(part.slice(0, 40));
      });
      return { ...current, technologies };
    });
    setTechDraft('');
  }

  function onThumbnail(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const { accepted, problems } = acceptImages([file]);
    if (problems[0]) {
      setErrors((current) => ({ ...current, thumbnail: problems[0] }));
      return;
    }
    setErrors((current) => ({ ...current, thumbnail: '' }));
    setThumbnailFile(accepted[0]);
    setRemoveThumbnail(false);
  }

  function onGallery(files: FileList | null) {
    if (!files?.length) return;
    const room = 8 - existingGallery.length - galleryFiles.length;
    if (room <= 0) {
      setErrors((current) => ({ ...current, gallery: 'Gallery is limited to 8 images.' }));
      return;
    }
    const { accepted, problems } = acceptImages(Array.from(files));
    const next = accepted.slice(0, room);
    if (accepted.length > room) problems.push('Gallery is limited to 8 images.');
    setGalleryFiles((current) => [...current, ...next]);
    setErrors((current) => ({ ...current, gallery: problems[0] || '' }));
  }

  const shownThumbnail = thumbnailPreview || (!removeThumbnail ? existingThumbnail?.url : '');
  const hasThumbnail = Boolean(thumbnailFile || (existingThumbnail && !removeThumbnail));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form, hasThumbnail);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).filter((key) => nextErrors[key]).length) return;

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('slug', form.slug.trim());
    body.append('shortDescription', form.shortDescription.trim());
    body.append('description', form.description.trim());
    body.append('category', form.category);
    body.append('technologies', JSON.stringify(form.technologies));
    body.append('projectUrl', form.projectUrl.trim());
    body.append('githubUrl', form.githubUrl.trim());
    body.append('status', form.status);
    body.append('keepGallery', JSON.stringify(existingGallery.map((image) => image.publicId)));
    if (removeThumbnail && !thumbnailFile) body.append('removeThumbnail', 'true');
    if (thumbnailFile) body.append('thumbnail', thumbnailFile);
    galleryFiles.forEach((file) => body.append('gallery', file));

    setSubmitting(true);
    setProgress(0);
    try {
      const result = await saveProject(id || null, body, setProgress);
      notify('success', result.message || 'Project saved.');
      navigate('/admin/projects');
    } catch (error) {
      const fieldErrors = getFieldErrors(error) || [];
      const mapped: Record<string, string> = {};
      fieldErrors.forEach((issue) => {
        mapped[issue.field] = issue.message;
      });
      setErrors(mapped);
      notify('error', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading project…</p>;

  return (
    <form onSubmit={onSubmit} noValidate>
      <Seo title={id ? 'Edit project — Trainonex studio' : 'New project — Trainonex studio'} noIndex />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link to="/admin/projects" className="text-sm text-muted hover:text-ink">
            Back to projects
          </Link>
          <h1 className="mt-2 font-serif text-5xl">{id ? 'Edit project' : 'New project'}</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant={form.status === 'draft' ? 'secondary' : 'ghost'} onClick={() => patch('status', 'draft')}>
            Draft
          </Button>
          <Button type="button" variant={form.status === 'published' ? 'primary' : 'ghost'} onClick={() => patch('status', 'published')}>
            Published
          </Button>
        </div>
      </div>

      {categoriesLoaded && categories.length === 0 && (
        <p className="mt-6 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          Create a category before you can save a project.{' '}
          <Link to="/admin/categories" className="text-accent-deep">
            Manage categories
          </Link>
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <input id="title" className={fieldClass(Boolean(errors.title))} value={form.title} onChange={(event) => patch('title', event.target.value)} />
          </Field>
          <Field label="Slug" htmlFor="slug" error={errors.slug} hint={form.slug ? `Public path: /work/${form.slug}` : 'Generated from the title if left blank.'}>
            <input
              id="slug"
              className={fieldClass(Boolean(errors.slug))}
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                patch('slug', event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'));
              }}
              onBlur={(event) => patch('slug', slugify(event.target.value))}
            />
          </Field>
          <Field label="Short description" htmlFor="shortDescription" error={errors.shortDescription} hint={`${form.shortDescription.length}/300`}>
            <textarea id="shortDescription" rows={3} className={fieldClass(Boolean(errors.shortDescription))} value={form.shortDescription} onChange={(event) => patch('shortDescription', event.target.value)} />
          </Field>
          <Field label="Case study" htmlFor="description" error={errors.description} hint="Separate paragraphs with a blank line.">
            <textarea id="description" rows={12} className={fieldClass(Boolean(errors.description))} value={form.description} onChange={(event) => patch('description', event.target.value)} />
          </Field>
          <Field label="Category" htmlFor="category" error={errors.category}>
            <select id="category" className={fieldClass(Boolean(errors.category))} value={form.category} onChange={(event) => patch('category', event.target.value)}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {form.technologies.map((tech) => (
                <button
                  type="button"
                  key={tech}
                  className="rounded-full bg-ink px-3 py-1 text-xs text-cream"
                  onClick={() => patch('technologies', form.technologies.filter((item) => item !== tech))}
                >
                  {tech} ×
                </button>
              ))}
            </div>
            <input
              className={`${fieldClass()} mt-3`}
              value={techDraft}
              placeholder="Type a technology and press Enter"
              onChange={(event) => setTechDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault();
                  addTechnologies(techDraft);
                }
              }}
              onBlur={() => techDraft.trim() && addTechnologies(techDraft)}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Project URL" htmlFor="projectUrl" error={errors.projectUrl} hint="Optional">
              <input id="projectUrl" className={fieldClass(Boolean(errors.projectUrl))} value={form.projectUrl} onChange={(event) => patch('projectUrl', event.target.value)} placeholder="https://" />
            </Field>
            <Field label="GitHub URL" htmlFor="githubUrl" error={errors.githubUrl} hint="Optional">
              <input id="githubUrl" className={fieldClass(Boolean(errors.githubUrl))} value={form.githubUrl} onChange={(event) => patch('githubUrl', event.target.value)} placeholder="https://github.com/" />
            </Field>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Thumbnail</p>
            <label
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white p-4 text-center"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onThumbnail(event.dataTransfer.files);
              }}
            >
              {shownThumbnail ? (
                <img src={shownThumbnail} alt="Thumbnail preview" className="mb-3 h-36 w-full rounded-2xl object-cover" />
              ) : (
                <ImagePlus className="mb-2 h-6 w-6 text-stone" />
              )}
              <span className="text-sm text-muted">Drop an image or browse</span>
              <span className="mt-1 text-xs text-stone">JPEG, PNG, WebP, or GIF · 5MB max</span>
              <input type="file" accept={ALLOWED.join(',')} className="sr-only" onChange={(event) => onThumbnail(event.target.files)} />
            </label>
            {shownThumbnail && (
              <button
                type="button"
                className="mt-2 text-sm text-danger"
                onClick={() => {
                  setThumbnailFile(null);
                  setRemoveThumbnail(true);
                }}
              >
                Remove thumbnail
              </button>
            )}
            {errors.thumbnail && <p className="mt-2 text-sm text-danger">{errors.thumbnail}</p>}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Gallery</p>
            <div className="grid grid-cols-2 gap-2">
              {existingGallery.map((image) => (
                <div key={image.publicId} className="relative">
                  <img src={image.url} alt="" className="aspect-square w-full rounded-2xl object-cover" />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-ink p-1 text-white"
                    aria-label="Remove gallery image"
                    onClick={() => setExistingGallery((current) => current.filter((item) => item.publicId !== image.publicId))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {galleryPreviews.map((url, index) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="aspect-square w-full rounded-2xl object-cover" />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-ink p-1 text-white"
                    aria-label="Remove new gallery image"
                    onClick={() => setGalleryFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label
              className="mt-3 flex cursor-pointer flex-col items-center rounded-3xl border border-dashed border-line bg-white px-4 py-6 text-center"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onGallery(event.dataTransfer.files);
              }}
            >
              <span className="text-sm text-muted">Add gallery images</span>
              <input
                type="file"
                accept={ALLOWED.join(',')}
                multiple
                className="sr-only"
                onChange={(event) => {
                  onGallery(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
            {errors.gallery && <p className="mt-2 text-sm text-danger">{errors.gallery}</p>}
          </div>
        </div>
      </div>

      {submitting && (
        <div className="mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent-deep transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-stone">Uploading {progress}%</p>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button type="submit" loading={submitting}>
          {id ? 'Save changes' : 'Create project'}
        </Button>
        <Link to="/admin/projects" className="inline-flex items-center rounded-full border border-line px-5 py-3 text-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
