import { MetadataRoute } from 'next';
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://farmconnect.chhatreshkhatri.com',
      lastModified: new Date(),
    }
  ];
}