import React, { useRef, useState } from 'react';
import { useUploadContract } from '../queries/contracts';
import { useQueryClient } from '@tanstack/react-query';
import type { ContractFormSchema } from '../contract-schemas';

interface ContractFormProps {
  closeForm: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ closeForm }) => {
  const [contractForm, setContractForm] = useState<ContractFormSchema>({});
  const fileChangeSpan = useRef<HTMLSpanElement>(null)

  const queryClient = useQueryClient()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContractForm({ ...contractForm, file })
      if (fileChangeSpan.current) {
        fileChangeSpan.current.innerText = `file uploaded: ${file.name}`
      }
    } else if (fileChangeSpan.current) {
      fileChangeSpan.current.innerText = "no file chosen"
    }
  };

  const handleContractChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

    setContractForm({ ...contractForm, contract_type: event.target.value })
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContractForm({ ...contractForm, contract_name: event.target.value })
  }

  const uploadContract = useUploadContract()
  const errorElem = useRef<HTMLSpanElement>(null)
  const handleUpload = () => {
    if (contractForm.file && contractForm.contract_type) {
      uploadContract.mutate(contractForm, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['contracts'] })
          closeForm()
        },

        onError: (error) => {
          if (errorElem.current) {
            errorElem.current.innerText = String(error)
          }
        }
      })
    }
  };

  return (

    <div className="mb-8 rounded-md p-4">
      {/* <h2 className="text-xl font-semibold text-green-700 mb-4">Upload Contract</h2> */}
      <div className="flex flex-col space-y-4">
        <div>
          <input type="text" name="contract_name" id="contract-name" placeholder='Enter Contract Name' onChange={handleInputChange} className='border border-green-300 rounded px-3 py-2 focus:outline-none w-full' value={contractForm.contract_name} />
        </div>
        <select className='border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full' onChange={handleContractChange} defaultValue={"none"}>
          <option value="none" disabled hidden>Choose Contract Type</option>
          <option value="NDA_CONTRACT">Non Disclosure Agreement</option>
          <option value="SUPPLIER_CONTRACT">Supplier Contract</option>
          <option value="EMPLOYMENT_CONTRACT">Employee Contract</option>

        </select>

        <div className="flex flex-row items-center gap-10">
          <label htmlFor="fileInput" className="text-white bg-green-200 hover:bg-green-400 px-2 py-2 rounded-md cursor-pointer text-[14px]">Choose File</label>
          <span id="file-name" className="text-[14px]" ref={fileChangeSpan}>No file chosen</span>
          <input id="fileInput" type="file" onChange={handleFileChange} className='hidden' />
        </div>
        <button
          onClick={handleUpload}
          disabled={!contractForm.file || !contractForm.contract_type || uploadContract.isPending}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {uploadContract.isPending ? 'Uploading...' : 'Upload Contract'}
        </button>

        <span ref={errorElem}></span>

      </div>
    </div>

  )

}

export default ContractForm;
