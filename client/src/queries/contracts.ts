import { useMutation, useQuery } from '@tanstack/react-query';
import type { ContractBase, ContractFormSchema } from '../schemas';


export const useGetContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const api_origin = import.meta.env.VITE_API_ORIGIN

      const response = await fetch(`${api_origin}/contract/get_all`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }

      const data: ContractBase[] = await response.json();

      return data
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useUploadContract = () => {
  return useMutation({
    mutationFn: async (contractForm: ContractFormSchema) => {

    const api_origin = import.meta.env.VITE_API_ORIGIN


      if (!contractForm.contract_name || !contractForm.contract_type || !contractForm.file) {
        throw new Error("form not completed")
      }
      const formData = new FormData()
      formData.append("contract_name", contractForm.contract_name)
      formData.append("contract_type", contractForm.contract_type)
      formData.append("file", contractForm.file)

      const response = await fetch(`${api_origin}/contract/upload`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error('Failed to upload contract');
      }

      const data: ContractBase = await response.json()

      return data
    }

  },)
}

export const useGetContract = (contractId: string | undefined) => {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      if (!contractId) {
        throw new Error('Missing contract ID');
      }
      const api_origin = import.meta.env.VITE_API_ORIGIN
      const response = await fetch(`${api_origin}/contract/get/${contractId}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch contract details');
      }
      return response.json();
    },
    enabled: !!contractId,
  })
}
