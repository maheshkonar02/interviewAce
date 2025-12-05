import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import { authenticateToken } from './auth.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
router.use(authenticateToken);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/resumes');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Upload resume
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // In production, you'd use a PDF/text extraction library here
    // For now, we'll create a basic resume entry
    const resume = new Resume({
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText: '', // Would be populated by PDF/text parser
      parsedData: {} // Would be populated by resume parser
    });

    await resume.save();

    // Update user's resume reference
    await User.findByIdAndUpdate(req.userId, { resume: resume._id });

    res.json({
      success: true,
      data: {
        resume: {
          id: resume._id,
          fileName: resume.fileName,
          uploadedAt: resume.uploadedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's resume
router.get('/', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ 
        success: false, 
        error: 'No resume found' 
      });
    }

    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    next(error);
  }
});

// Delete resume
router.delete('/:id', async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!resume) {
      return res.status(404).json({ 
        success: false, 
        error: 'Resume not found' 
      });
    }

    // Delete file
    try {
      const filePath = path.join(__dirname, '../../', resume.filePath);
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn('Error deleting resume file:', error);
    }

    // Remove resume reference from user
    await User.findByIdAndUpdate(req.userId, { $unset: { resume: 1 } });

    // Delete resume record
    await Resume.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

