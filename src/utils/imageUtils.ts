// Utility functions for handling image file uploads and base64 conversion

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Image file size must be less than 5MB",
    };
  }

  return { valid: true };
};

export const isBase64Image = (str: string): boolean => {
  if (!str) return false;

  // Check if string starts with data:image/ and contains base64
  const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Pattern.test(str);
};

export const getImageSrc = (imageData: string): string => {
  if (!imageData) return "";

  // If it's already a base64 string, return as is
  if (isBase64Image(imageData)) {
    return imageData;
  }

  // If it's a URL, return as is (for backward compatibility)
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    return imageData;
  }

  // Otherwise, assume it's base64 without the data URL prefix and add it
  if (imageData.length > 0) {
    return `data:image/jpeg;base64,${imageData}`;
  }

  return "";
};
