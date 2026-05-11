import { readFile } from 'fs/promises';
import { join } from 'path';

export async function getContent(): Promise<any> {
  try {
    const filePath = join(process.cwd(), 'src/lib/content.json');
    const data = await readFile(filePath, 'utf-8');
    const content = JSON.parse(data);
    return content.siteContent;
  } catch (error) {
    console.error('Error reading content:', error);
    return null;
  }
}
