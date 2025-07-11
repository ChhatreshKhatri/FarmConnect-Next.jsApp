"use client";

import { getImageSrc, isBase64Image } from "@/utils/imageUtils";

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export default function ImageDisplay({ src, alt, className = "w-full h-48 object-cover", fallbackText = "No image available" }: ImageDisplayProps) {
  const imageSrc = getImageSrc(src);

  if (!imageSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">{fallbackText}</span>
      </div>
    );
  }

  // For base64 images, we can safely use img tag
  // For external URLs, we should use Next.js Image component
  if (isBase64Image(imageSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageSrc} alt={alt} className={className} />
    );
  }

  // For external URLs, fallback to a simple img tag with warning comment
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageSrc} alt={alt} className={className} />
  );
}
