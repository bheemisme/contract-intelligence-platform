import { useGetContracts } from '../queries/contracts';
import ContractComp from '../components/ContractComp';
import ContractForm from '../components/ContractForm';
import type { ContractSchema } from '../schemas';

import { Button, Checkbox, Label, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";
import { useState } from "react";

const Contracts = () => {

  const { isLoading, error, data: contracts } = useGetContracts()

  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Contracts</h1>
      <Button className='border bg-green-700 text-white w-full py-2 rounded-md cursor-pointer' onClick={() => setOpenModal(true)}>Upload Contract</Button>
 
      <Modal show={openModal} onClose={() => setOpenModal(false)} className='rounded-xl' size={"sm"} position={"center-right"} popup>
        <ModalHeader className='text-xl font-semibold text-green-800 p-2'>Upload Contract</ModalHeader>
        <ModalBody>

          <ContractForm />

        </ModalBody>
      </Modal>


      <div>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Uploaded Contracts</h2>
        {isLoading ? (
          <p className="text-green-600">Loading contracts...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load contracts.</p>
        ) : contracts && contracts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract: ContractSchema, index: number) => (
              <ContractComp key={index} contract={contract} />
            ))}
          </div>
        ) : (
          <p className="text-green-600">No contracts uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Contracts;