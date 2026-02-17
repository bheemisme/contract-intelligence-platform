import { useGetContracts } from '@/queries/contracts';
import ContractComp from '@/components/ContractComp';
import ContractForm from '@/components/ContractForm';
import type { ContractBase } from '@/contract-schemas';

import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { QueryClient } from '@tanstack/react-query';


const Contracts = () => {

  const queryClient = new QueryClient()
  const navigate = useNavigate()
  const { isLoading, error, data: contracts } = useGetContracts()


  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    if (error?.cause === 401) {
      queryClient.clear()
      navigate('/')
    }
  }, [error])

  return (
    <div className="relative p-4 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Contracts</h1>

      {openModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="contracts-modal relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-800">Upload Contract</h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-green-600 hover:text-green-800 cursor-pointer"
              >
                &#10005;
              </button>
            </div>
            <ContractForm closeForm={() => setOpenModal(false)} />
          </div>
        </div>
      )}


      <div className="pb-24">
        {isLoading ? (
          <p className="text-green-600">

            {/* Add a small green colored scrolling */}
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Loading contracts...</span>
            </div>
          </p>

        ) : error ? (
          <p className="text-red-500">Failed to load contracts.</p>
        ) : contracts && contracts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract: ContractBase, index: number) => (
              <ContractComp key={index} contract={contract} />
            ))}
          </div>
        ) : (
          <p className="text-green-600">No contracts uploaded yet.</p>
        )}
      </div>

      <Button
        className='border bg-green-700 text-white px-6 py-3 rounded-full cursor-pointer shadow-xl fixed bottom-8 right-8 z-10'
        onClick={() => setOpenModal(true)}
      >
        Upload Contract
      </Button>
    </div>
  );
};

export default Contracts;
