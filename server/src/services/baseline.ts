import { Admin } from '../models/Admin';
import { Category } from '../models/Category';
import { Project } from '../models/Project';
import { env } from '../config/env';
import { slugify } from '../utils/slug';

const DEFAULT_CATEGORIES = ['Web Platforms', 'Product Design', 'Brand Identity', 'Mobile Products'];

async function collapseDuplicateCategories(): Promise<void> {
  const categories = await Category.find().sort({ createdAt: 1 });
  const keeper = new Map<string, (typeof categories)[number]>();

  for (const category of categories) {
    const existing = keeper.get(category.slug);
    if (!existing) {
      keeper.set(category.slug, category);
      continue;
    }
    await Project.updateMany({ category: category._id }, { category: existing._id });
    await category.deleteOne();
  }
}

export async function ensureBaseline(): Promise<void> {
  await collapseDuplicateCategories();

  for (const name of DEFAULT_CATEGORIES) {
    const slug = slugify(name);
    await Category.updateOne({ slug }, { $setOnInsert: { name, slug } }, { upsert: true });
  }

  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) return;

  if (!env.admin.email || !env.admin.password) {
    console.warn('No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD, then restart the server or run npm run seed.');
    return;
  }

  if (env.admin.password.length < 8) {
    console.warn('ADMIN_PASSWORD must be at least 8 characters. The admin account was not created.');
    return;
  }

  try {
    await Admin.create({
      name: env.admin.name || 'Trainonex Admin',
      email: env.admin.email.toLowerCase().trim(),
      password: env.admin.password,
      role: 'admin',
    });
    console.log(`Admin account created for ${env.admin.email.toLowerCase().trim()}.`);
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 11000) throw error;
  }
}

export async function resetAdminPassword(): Promise<void> {
  if (!env.admin.email || !env.admin.password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before resetting the password.');
  }
  if (env.admin.password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  const admin = await Admin.findOne({ email: env.admin.email.toLowerCase().trim() }).select('+password');
  if (!admin) throw new Error('No admin account matches ADMIN_EMAIL.');

  admin.password = env.admin.password;
  if (env.admin.name) admin.name = env.admin.name;
  await admin.save();
  console.log(`Password updated for ${admin.email}.`);
}
