const fs = require('fs');
const path = require('path');
const multer = require('multer');

const submissionsDir = path.join(process.cwd(), 'uploads', 'submissions');
const projectReferencesDir = path.join(process.cwd(), 'uploads', 'project-references');
fs.mkdirSync(submissionsDir, { recursive: true });
fs.mkdirSync(projectReferencesDir, { recursive: true });

function makeStorage(destinationDir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destinationDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      const safeBase = path.basename(file.originalname || 'file', ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${ext}`);
    },
  });
}

const submissionsStorage = makeStorage(submissionsDir);
const projectReferenceStorage = makeStorage(projectReferencesDir);

const uploadSubmissionFiles = multer({
  storage: submissionsStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
}).array('submissionFiles', 5);

const uploadProjectReferenceFiles = multer({
  storage: projectReferenceStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
}).array('projectReferenceFiles', 5);

module.exports = {
  uploadSubmissionFiles,
  uploadProjectReferenceFiles,
};

function fileFilter(_req, file, cb) {
  const allowed = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/plain',
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type'));
  }
  return cb(null, true);
}
