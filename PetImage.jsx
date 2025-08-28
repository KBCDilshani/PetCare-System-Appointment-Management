import { useState } from 'react';
import { ensureFullImageUrl } from '../services/petService';

export default function PetImage({ src, alt, className }) {
  const [error, setError] = useState(false);
  const fallbackImage = '/images/pet-placeholder.jpg'; // Create a placeholder image
  
  // Handle empty or undefined src
  if (!src) {
    return (
      <img
        src={fallbackImage}
        alt={alt || "Pet"}
        className={className}
      />
    );
  }
  
  // Process the URL
  const imageUrl = ensureFullImageUrl(src);
  
  return (
    <img
      src={error ? fallbackImage : imageUrl}
      alt={alt || "Pet"}
      className={className}
      onError={() => {
        console.log("Image failed to load:", imageUrl);
        setError(true);
      }}
    />
  );
}