import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tempDirectory = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  file_destination: tempDirectory,
  storage: multer.diskStorage({
    destination: tempDirectory,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};
