import { useMutation } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_ENV === 'development'
  ? 'http://localhost:5000'
  : 'https://contract-intelligence-platform.onrender.com';

export const useUploadContract = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload_contract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload contract');
      }

      return response.json();
    },
  });
};