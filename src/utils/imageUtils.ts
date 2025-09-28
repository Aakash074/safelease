// Utility functions for handling images in the application

export const getImagePath = (imageName: string): string => {
  // Ensure the path starts with / for public assets
  if (imageName.startsWith('/')) {
    return imageName;
  }
  return `/images/${imageName}`;
};

export const getFallbackImage = (): string => {
  return '/images/lpi1.jpeg';
};

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const target = event.target as HTMLImageElement;
  target.src = getFallbackImage();
};

// Preload images for better performance
export const preloadImages = (imagePaths: string[]): Promise<void[]> => {
  const promises = imagePaths.map((path) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${path}`);
        resolve(); // Don't reject, just log the warning
      };
      img.src = getImagePath(path);
    });
  });
  
  return Promise.all(promises);
};
