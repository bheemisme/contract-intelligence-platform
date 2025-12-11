import React from 'react';
import type { ContractSchema } from "../schemas";

interface ContractCompProps {
    contract: ContractSchema;
}

const ContractComp: React.FC<ContractCompProps> = ({ contract }) => {
    const bucket_name = import.meta.env.VITE_GOOGLE_CLOUD_BUCKET
    const pdf_uri = `https://storage.googleapis.com/${bucket_name}/pdfs/${contract.pdf_uri}`;

    return (
        <div className="bg-white rounded-lg shadow-md border border-green-200 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-green-800 mb-3">{contract.contract_name}</h3>

            <div className="space-y-2 mb-4">
                <p className="text-sm text-green-600">
                    <span className="font-medium">Contract ID:</span> {contract.contract_id}
                </p>
                <p className="text-sm text-green-600">
                    <span className="font-medium">Type:</span> {contract.contract_type}
                </p>
            </div>

            <div className="flex space-x-4">
                <a
                    href={pdf_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                    📄 View PDF
                </a>
            </div>
        </div>
    );
};

export default ContractComp;