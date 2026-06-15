import { Schema, model } from 'mongoose';

export interface IRepositoryTreeFile {
  path: string;
  extension: string;
  size: number;
  hash: string;
}

export interface IRepositoryTreeFolder {
  path: string;
}

export interface IRepositoryTree {
  id: string;
  repositoryId: string;
  files: IRepositoryTreeFile[];
  folders: IRepositoryTreeFolder[];
  scannedAt: Date;
}

const repositoryTreeFileSchema = new Schema<IRepositoryTreeFile>(
  {
    path: { type: String, required: true },
    extension: { type: String, default: '' },
    size: { type: Number, required: true },
    hash: { type: String, required: true },
  },
  { _id: false },
);

const repositoryTreeFolderSchema = new Schema<IRepositoryTreeFolder>(
  {
    path: { type: String, required: true },
  },
  { _id: false },
);

const repositoryTreeSchema = new Schema<IRepositoryTree>({
  repositoryId: { type: String, required: true, index: true },
  files: { type: [repositoryTreeFileSchema], default: [] },
  folders: { type: [repositoryTreeFolderSchema], default: [] },
  scannedAt: { type: Date, required: true, default: Date.now },
});

export const RepositoryTreeModel = model<IRepositoryTree>('RepositoryTree', repositoryTreeSchema);
