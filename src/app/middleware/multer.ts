import multer from 'multer';


const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {

  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('audio/') || 
    file.mimetype.startsWith('video/')  
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images, pdf, audio and video are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});