import {promises as fs} from 'fs';
import {HyperSchema4} from './types/hyper-schema';

export const DEFAULT_ENCODING = 'utf8';

export interface FileWithContent {
  name: string;
  path: string[];
  content: string;
}

export async function writeOutFile(outDir: string, file: FileWithContent): Promise<void> {
  const path = [outDir, ...file.path].join('/');
  await fs.mkdir(path, {recursive: true});
  await fs.writeFile([path, file.name + '.ts'].join('/'), file.content, DEFAULT_ENCODING);
}

export async function readHyperSchema(hyperSchemaFile: string) {
  return JSON.parse((await fs.readFile(hyperSchemaFile, DEFAULT_ENCODING))) as HyperSchema4;
}

export async function writeOutFiles(outDir: string, files: FileWithContent[]) {
  for (let file of files) {
    await writeOutFile(outDir, file);
  }
}
