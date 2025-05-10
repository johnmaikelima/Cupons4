import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from 'slugify'
import { Model } from 'mongoose'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function generateUniqueSlug(text: string, model: Model<any>) {
  let slug = slugify(text, { lower: true, strict: true });
  let counter = 1;
  let uniqueSlug = slug;

  while (await model.exists({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
