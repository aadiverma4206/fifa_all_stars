/**
 * File Validation & Upload Safety Utilities
 * Provides complete validation, format checking, size limit enforcement,
 * duplicate detection, and safe async processing for all file upload actions.
 */

// Allowed MIME types and extensions
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska'
];

export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.mkv'];

export const DEFAULT_MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const DEFAULT_MAX_AVATAR_SIZE = 5 * 1024 * 1024;  // 5 MB
export const DEFAULT_MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
export const MIN_FILE_SIZE = 100; // 100 bytes to prevent corrupt/empty files

/**
 * Format bytes to human readable string (KB, MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file extension in lowercase including dot (e.g. '.jpg')
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

/**
 * Validate a single file against type, extension, size, and metadata constraints.
 * Returns { isValid: boolean, message?: string }
 */
export function validateFile(file, options = {}) {
  const {
    allowedTypes = ALLOWED_IMAGE_TYPES,
    allowedExtensions = ALLOWED_IMAGE_EXTENSIONS,
    maxSizeBytes = DEFAULT_MAX_IMAGE_SIZE,
    minSizeBytes = MIN_FILE_SIZE,
    fileCategoryName = 'file'
  } = options;

  // 1. Check if file is provided
  if (!file) {
    return {
      isValid: false,
      message: `No ${fileCategoryName} selected. Please choose a file to upload.`
    };
  }

  // 2. Prevent empty / 0-byte files
  if (file.size < minSizeBytes) {
    return {
      isValid: false,
      message: `The selected ${fileCategoryName} appears to be empty or corrupted (size: ${file.size} bytes).`
    };
  }

  // 3. Validate maximum file size
  if (file.size > maxSizeBytes) {
    const formattedMax = formatFileSize(maxSizeBytes);
    const formattedActual = formatFileSize(file.size);
    return {
      isValid: false,
      message: `${file.name} (${formattedActual}) exceeds the maximum allowed size of ${formattedMax}.`
    };
  }

  // 4. Validate file extension
  const ext = getFileExtension(file.name);
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      message: `Unsupported file format "${ext}". Allowed formats: ${allowedExtensions.join(', ')}.`
    };
  }

  // 5. Validate MIME type if available from browser
  if (file.type && allowedTypes.length > 0) {
    const matchesType = allowedTypes.some(t => {
      if (t.endsWith('/*')) {
        const prefix = t.slice(0, -1);
        return file.type.startsWith(prefix);
      }
      return file.type === t;
    });

    if (!matchesType && !allowedExtensions.includes(ext)) {
      return {
        isValid: false,
        message: `File type "${file.type}" is not supported for ${fileCategoryName} uploads.`
      };
    }
  }

  // 6. Validate filename metadata (prevent unsafe path traversal or malicious naming)
  if (file.name.includes('/') || file.name.includes('\\') || file.name.includes('..')) {
    return {
      isValid: false,
      message: `Invalid file name. Special path characters are not allowed in file names.`
    };
  }

  return { isValid: true };
}

/**
 * Validate a list of files against maximum count, total size, and individual validity.
 */
export function validateFileList(fileList, options = {}) {
  const {
    maxFiles = 1,
    existingFiles = [],
    fileCategoryName = 'file'
  } = options;

  const files = Array.from(fileList || []);

  // 1. Check for empty selection
  if (files.length === 0) {
    return {
      isValid: false,
      message: `Please select a ${fileCategoryName} to proceed.`
    };
  }

  // 2. Validate maximum file count
  if (files.length > maxFiles) {
    return {
      isValid: false,
      message: `You can upload at most ${maxFiles} ${fileCategoryName}${maxFiles > 1 ? 's' : ''} at a time.`
    };
  }

  // 3. Check for duplicates within the current selection
  const seenNames = new Set();
  for (const f of files) {
    const signature = `${f.name}_${f.size}_${f.lastModified}`;
    if (seenNames.has(signature)) {
      return {
        isValid: false,
        message: `Duplicate file "${f.name}" detected in your selection.`
      };
    }
    seenNames.add(signature);
  }

  // 4. Check for duplicates against existing uploaded files
  if (existingFiles.length > 0) {
    for (const f of files) {
      const isDuplicate = existingFiles.some(ex => {
        if (typeof ex === 'string') {
          return ex.includes(f.name);
        }
        return (ex.name === f.name && ex.size === f.size) || ex.url?.includes(f.name);
      });

      if (isDuplicate) {
        return {
          isValid: false,
          message: `"${f.name}" has already been uploaded.`
        };
      }
    }
  }

  // 5. Validate each individual file
  for (const file of files) {
    const res = validateFile(file, options);
    if (!res.isValid) {
      return res;
    }
  }

  return { isValid: true, files };
}

/**
 * Safely read a file into a Data URL (base64) with abort and progress support
 */
export function readFileAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided to read.'));
      return;
    }

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = () => {
      if (typeof onProgress === 'function') onProgress(100);
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error(reader.error?.message || 'Failed to read file from disk.'));
    };

    reader.onabort = () => {
      reject(new Error('File reading was cancelled by user.'));
    };

    reader.readAsDataURL(file);
  });
}
