import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { slugify } from '@/utils/slugify';

export interface MarkdownDocument {
  slug: string;
  category?: string;
  frontmatter: {
    title: string;
    description: string;
    date: string;
    category?: string;
    [key: string]: any;
  };
  content: string;
  filePath: string;
  type: 'article' | 'roadmap';
}

const contentDirectory = path.join(process.cwd(), 'content');

export function getAllMarkdownFiles(dirPath: string = contentDirectory, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles;
  }
  
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllMarkdownFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

export function parseMarkdownFile(filePath: string): MarkdownDocument | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Determine type based on folder path
    const normalizedPath = filePath.replace(/\\/g, '/');
    const type = normalizedPath.includes('/content/roadmap/') ? 'roadmap' : 'article';
    
    // Extract category and slug from filename or frontmatter
    let category = data.category;
    let slug = '';
    
    if (type === 'article') {
      const parts = normalizedPath.split('/');
      const articlesIndex = parts.indexOf('articles');
      if (articlesIndex !== -1 && parts.length > articlesIndex + 2) {
        category = parts[articlesIndex + 1]; // content/articles/[category]/slug.md
      }
      slug = path.basename(filePath, path.extname(filePath));
    } else {
      // Roadmap specific slug handling if needed
      slug = path.basename(filePath, path.extname(filePath));
    }

    // Default title if missing
    if (!data.title) {
      data.title = slug.replace(/-/g, ' ');
    }
    
    // Default date if missing
    if (!data.date) {
      const stat = fs.statSync(filePath);
      data.date = stat.mtime.toISOString();
    }

    return {
      slug,
      category,
      frontmatter: data as MarkdownDocument['frontmatter'],
      content,
      filePath,
      type,
    };
  } catch (e) {
    console.error(`Error parsing markdown file ${filePath}:`, e);
    return null;
  }
}

export function getAllContent(): MarkdownDocument[] {
  const files = getAllMarkdownFiles();
  const content = files
    .map((file) => parseMarkdownFile(file))
    .filter((doc): doc is MarkdownDocument => doc !== null);
  
  // Sort by date descending
  return content.sort((a, b) => {
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });
}

export function getArticles(): MarkdownDocument[] {
  return getAllContent().filter(doc => doc.type === 'article');
}

export function getRoadmapTopics(): MarkdownDocument[] {
  return getAllContent().filter(doc => doc.type === 'roadmap');
}
