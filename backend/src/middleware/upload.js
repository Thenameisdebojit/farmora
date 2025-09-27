// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration for different file types
const createStorage = (destination) => {
  ensureDirectoryExists(destination);
  
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });
};

// File filter functions
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimetypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const mimetype = allowedMimetypes.includes(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed'));
  }
};

// Upload configurations for different purposes
const uploadConfigs = {
  // Pest detection images
  pestImages: multer({
    storage: createStorage('uploads/pest-images/'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1
    }
  }),

  // User profile images
  profileImages: multer({
    storage: createStorage('uploads/profile-images/'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    }
  }),

  // Consultation attachments
  consultationFiles: multer({
    storage: createStorage('uploads/consultation-files/'),
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const allowedMimetypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const mimetype = allowedMimetypes.includes(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images and documents are allowed'));
      }
    },
    limits: {
      fileSize: 15 * 1024 * 1024, // 15MB
      files: 5
    }
  }),

  // Crop images for advisory
  cropImages: multer({
    storage: createStorage('uploads/crop-images/'),
    fileFilter: imageFilter,
    limits: {
      fileSize: 8 * 1024 * 1024, // 8MB
      files: 3
    }
  })
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Please choose a smaller file.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Please select fewer files.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

// Helper function to create upload middleware with error handling
const createUploadMiddleware = (uploadType, fieldName, maxCount = 1) => {
  const upload = uploadConfigs[uploadType];
  
  if (!upload) {
    throw new Error(`Unknown upload type: ${uploadType}`);
  }

  return (req, res, next) => {
    const uploadHandler = maxCount === 1 
      ? upload.single(fieldName)
      : upload.array(fieldName, maxCount);
    
    uploadHandler(req, res, (error) => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      next();
    });
  };
};

// Cleanup old files (utility function)
const cleanupOldFiles = (directory, maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        const now = new Date().getTime();
        const fileTime = new Date(stats.mtime).getTime();

        if (now - fileTime > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            } else {
              console.log('Deleted old file:', filePath);
            }
          });
        }
      });
    });
  });
};

// File validation utilities
const validateFileType = (file, allowedTypes) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  return allowedTypes.includes(fileExtension);
};

const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

module.exports = {
  uploadConfigs,
  createUploadMiddleware,
  handleUploadError,
  cleanupOldFiles,
  validateFileType,
  validateFileSize,
  sanitizeFileName,
  imageFilter,
  documentFilter
};
