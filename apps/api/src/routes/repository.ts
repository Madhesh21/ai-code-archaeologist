import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { ZipExtractionService } from '../services/repository/ZipExtractionService.js';
import { RepositoryValidationService } from '../services/repository/RepositoryValidationService.js';
import { FileStorageService } from '../services/repository/FileStorageService.js';
import { UploadService } from '../services/repository/UploadService.js';
import { RepositoryRepository } from '../infrastructure/database/repositories/RepositoryRepository.js';
import { env } from '../config/env.js';

const router: Router = Router();

const upload = multer({
  dest: path.join(env.UPLOAD_DIR, 'temp'),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.zip')) {
      cb(new Error('Only ZIP files are allowed'));
    }
    cb(null, true);
  },
});

const zipExtraction = new ZipExtractionService();
const validation = new RepositoryValidationService();
const storage = new FileStorageService(path.resolve(env.UPLOAD_DIR, 'repositories'));
const repositoryRepo = new RepositoryRepository();
const uploadService = new UploadService(zipExtraction, validation, storage, repositoryRepo);

router.post('/repositories/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file provided' },
      });
      return;
    }

    const tempDir = path.dirname(req.file.path);
    const result = await uploadService.upload(req.file.path, req.file.originalname, tempDir);

    res.status(201).json({
      success: true,
      data: {
        repositoryId: result.repositoryId,
        status: result.repository.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/repositories/:id', async (req, res, next) => {
  try {
    const repository = await repositoryRepo.findById(req.params.id);

    if (!repository) {
      res.status(404).json({
        success: false,
        error: { code: 'RESOURCE_NOT_FOUND', message: 'Repository not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: (repository as unknown as Record<string, string>).id,
        name: repository.name,
        description: repository.description,
        sourceType: repository.sourceType,
        status: repository.status,
        createdAt: repository.createdAt,
        updatedAt: repository.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as repositoryRouter };
