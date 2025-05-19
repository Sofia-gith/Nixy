
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

 cloudinary.config({ 
        cloud_name: 'dhhvgocpf', 
        api_key: '519282846571695', 
        api_secret: '76SJJsQGz32T6NxS2CyR6fYc9BU' 
    });
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'perfil_usuario',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});



export { cloudinary, storage };
