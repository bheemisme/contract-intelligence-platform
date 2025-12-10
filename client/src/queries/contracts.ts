import { useMutation, useQuery } from '@tanstack/react-query';
import type { ContractFormSchema } from '../schemas';

const API_BASE_URL = import.meta.env.VITE_ENV === 'development'
  ? 'http://127.0.0.1:8000'
  : 'https://contract-intelligence-platform.onrender.com';


export const useGetContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/contract/get_all`)

      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }

      return response.json()
    }
  });
};

export const useUploadContract = () => {
  return useMutation({
    mutationFn: async (contractForm: ContractFormSchema) => {

      if (!contractForm.contract_type || !contractForm.file) {
        throw new Error("form not completed")
      }
      const formData = new FormData()
      formData.append("contract_type", contractForm.contract_type)
      formData.append("file", contractForm.file)

      const response = await fetch(`${API_BASE_URL}/contract/upload?contract_type=NDA_CONTRACT`, {
        method: 'POST',
        body: formData,

      })

      if (!response.ok) {
        throw new Error('Failed to upload contract');
      }

      return response.json();
    }

  },)
}