const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.72;

export const compressFoodImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Could not read the selected image'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('This image format cannot be processed by the browser'));
    image.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Could not compress the image'));
        resolve(new File([blob], 'food-thumbnail.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', JPEG_QUALITY);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});
