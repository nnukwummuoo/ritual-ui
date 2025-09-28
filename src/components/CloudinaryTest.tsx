import React, { useState } from 'react';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinary';

const CloudinaryTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setResult('');

    try {
      // Validate the file
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file, {
        folder: 'test-uploads',
        tags: ['test', 'profile']
      });

      setResult(`Upload successful! URL: ${uploadResult.secure_url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Cloudinary Test</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {result && <p style={{ color: 'green' }}>{result}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CloudinaryTest;
