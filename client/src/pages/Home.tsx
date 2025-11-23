import React, { useState } from 'react';
import { useUploadContract } from '../queries/contracts';

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContracts, setUploadedContracts] = useState<string[]>([]);

  const uploadMutation = useUploadContract();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile, {
        onSuccess: (data) => {
          console.log('Upload successful:', data);
          setUploadedContracts(prev => [...prev, data.filename]);
          setSelectedFile(null);
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contract Intelligence Platform</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload Contract</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Contract'}
        </button>
        {uploadMutation.isError && (
          <p className="text-red-500 mt-2">Upload failed. Please try again.</p>
        )}
        {uploadMutation.isSuccess && (
          <p className="text-green-500 mt-2">Contract uploaded successfully!</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Uploaded Contracts</h2>
        {uploadedContracts.length === 0 ? (
          <p>No contracts uploaded yet.</p>
        ) : (
          <ul className="list-disc list-inside">
            {uploadedContracts.map((filename, index) => (
              <li key={index}>{filename}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;