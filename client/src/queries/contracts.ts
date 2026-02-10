import { useMutation, useQuery } from '@tanstack/react-query';
import type { ContractBase, ContractFormSchema, Contract, ValidationReport } from '../contract-schemas';


export const useGetContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const api_origin = import.meta.env.VITE_API_ORIGIN

      const response = await fetch(`${api_origin}/contract/get_all`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data: ContractBase[] = await response.json();
        return data
      }

    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
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

export const useGetContractWithoutValidation = (contractId: string) => {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      if (!contractId) {
        throw new Error('Missing contract ID');
      }
      const api_origin = import.meta.env.VITE_API_ORIGIN
      const response = await fetch(`${api_origin}/contract/get_unval/${contractId}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch contract details');
      }
      const data: ContractBase = await response.json();
      return data;
    },
    retry: 2,
    refetchOnWindowFocus: false
  })
}

export const useGetContract = (contractId: string | null) => {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      const api_origin = import.meta.env.VITE_API_ORIGIN
      const response = await fetch(`${api_origin}/contract/get/${contractId}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch contract details');
      }
      const data: Contract = await response.json();
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!contractId,
  })
}

export const useFillContract = (contractId: string) => {
  return useMutation({
    mutationKey: ["contract", contractId],
    mutationFn: async (contractId: string) => {
      const api_origin = import.meta.env.VITE_API_ORIGIN
      const response = await fetch(`${api_origin}/contract/fill`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "contract_id": contractId })
      })

      if (!response.ok) {
        throw new Error('Failed to fill contract');
      }

      const data: Contract = await response.json();
      return data;
    },
    onError: (error) => {
      console.error('Error filling contract:', error);
    },
    onSuccess: () => {
      console.log('Contract filled successfully');
    },

  })
}


export const useValidateContract = (contractId: string) => {
  return useQuery({
    queryKey: ['contract', "validation", contractId],
    queryFn: async () => {
      const api_origin = import.meta.env.VITE_API_ORIGIN
      const response = await fetch(`${api_origin}/contract/validate/${contractId}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to validate contract');
      }
      const data: ValidationReport = await response.json();
      return data;
    },
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
  })
}

export const useGetValidationReport = (contractId: string) => {
  return useQuery({
    queryKey: ['contract', "validation", contractId],
    queryFn: async () => {
      const api_origin = import.meta.env.VITE_API_ORIGIN
      const response = await fetch(`${api_origin}/contract/validate/get/${contractId}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch validation report');
      }
      const data: ValidationReport = await response.json();
      return data;
    },
    enabled: true,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchIntervalInBackground: false,
  })

}