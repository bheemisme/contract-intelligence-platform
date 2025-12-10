import React, { useState } from 'react';
import { useUploadContract, useGetContracts } from '../queries/contracts';
import { useQueryClient } from '@tanstack/react-query';
import type { ContractFormSchema, ContractSchema } from '../schemas';
import { ContractComp } from '../components/ContractComp';


const Contracts = () => {

  const [contractForm, setContractForm] = useState<ContractFormSchema>({});

  const queryClient = useQueryClient()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContractForm((currentForm) => {
        return {
          ...currentForm, file: file
        }
      })
    }
  };

  const handleContractChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const contract_type = event.target?.value
    setContractForm({ ...contractForm, contract_type })
  }

  const uploadContract = useUploadContract()
  const handleUpload = () => {
    if (contractForm.file && contractForm.contract_type) {
      uploadContract.mutate(contractForm, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['contracts'] })
        }
      })
    }
  };

  const { isLoading, error, data: contracts } = useGetContracts()


  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Contracts</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Upload Contract</h2>
        <div className="flex flex-col space-y-4">
          <select className='border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500' onChange={handleContractChange}>
            <option value="None" selected>Choose Contract Type</option>
            <option value="NDA_CONTRACT">Non Disclosure Agreement</option>
            <option value="SUPPLIER_CONTRACT">Supplier Contract</option>
            <option value="EMPLOYEE_CONTRACT">Employee Contract</option>

          </select>

          <div className="flex flex-row items-center gap-10">
            <label htmlFor="fileInput" className="text-white bg-green-200 hover:bg-green-400 px-2 py-2 rounded-md cursor-pointer text-[14px]">Choose File</label>
            <span id="file-name" className="text-[14px]">No file chosen</span>
            <input id="fileInput" type="file" onChange={handleFileChange} className='hidden'/>
          </div>
          <button
            onClick={handleUpload}
            disabled={!contractForm.file || uploadContract.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadContract.isPending ? 'Uploading...' : 'Upload Contract'}
          </button>

        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Uploaded Contracts</h2>
        {isLoading ? (
          <p className="text-green-600">Loading contracts...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load contracts.</p>
        ) : contracts && contracts.length > 0 ? (
          <ul className="space-y-2">
            {contracts.map((contract: ContractSchema, index: number) => (
              <li key={index} className="bg-white p-4 rounded shadow border border-green-200">
                <ContractComp {...contract} />
              </li>


            ))}
          </ul>
        ) : (
          <p className="text-green-600">No contracts uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Contracts;