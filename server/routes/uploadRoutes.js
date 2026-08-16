import express from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { config } from '../config/env.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadToFirebase } from '../services/firebaseService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxImageBytes, files: 1 },
  fileFilter: (req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
const router = express.Router();

const uploadImage = (folder) => async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
    const result = await uploadToFirebase({ buffer: req.file.buffer, mimeType: req.file.mimetype, folder, userId: req.user.id, fileName: `${randomUUID()}.${req.file.mimetype.split('/')[1]}` });
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
};

router.post('/profile-picture', protect, upload.single('image'), uploadImage('profile-pictures'));
router.post('/other', protect, upload.single('image'), uploadImage('other-uploads'));

export default router;
