import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useGetContract, useGetContracts } from '../queries/contracts';

const LoadingView = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
        <svg className="w-20 h-20 animate-spin text-green-700" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-6 text-lg font-semibold text-green-800">{message}</p>
    </div>
);

const renderValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) {
        return <span className="text-green-500">—</span>;
    }

    if (typeof value === 'boolean') {
        return <span className="text-green-800">{value ? 'Yes' : 'No'}</span>;
    }

    if (Array.isArray(value)) {
        return (
            <div className="space-y-2">
                {value.map((item, index) => (
                    <div key={`${key}-${index}`} className="pl-4 border-l border-green-200">
                        {renderValue(key, item)}
                    </div>
                ))}
            </div>
        );
    }

    if (typeof value === 'object') {
        return (
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(value).map(([childKey, childValue]) => (
                    <div key={`${key}-${childKey}`} className="pl-4 border-l border-green-200">
                        <p className="text-xs uppercase text-green-500 mb-1">{childKey}</p>
                        {renderValue(childKey, childValue)}
                    </div>
                ))}
            </div>
        );
    }

    if (key === 'pdf_uri' || key === 'md_uri') {
        const bucket = import.meta.env.VITE_GOOGLE_CLOUD_BUCKET;
        const uri = `https://storage.googleapis.com/${bucket}/${value}`;
        return (
            <a
                href={uri}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-green-700 underline"
            >
                View document
            </a>
        );
    }

    return <span className="text-green-800">{value.toString()}</span>;
};

const ContractDetail: React.FC = () => {
    const { contractId } = useParams<{ contractId?: string }>();
    //   const { data: contract, isLoading, error } = useGetContract(contractId);
    const navigate = useNavigate()

    if (!contractId) {
        return <p className="p-6 text-red-600">Contract identifier missing from the URL.</p>;
    }

    const { data: contracts, isLoading, error } = useGetContracts()

    const contract = contracts?.find((value) => {
        if (value.contract_id === contractId) {
            return true
        }
        return false
    })




    if (!contract) {
        navigate("/contracts")
    }

    //   if (isLoading) {
    //     return <LoadingView message="Fetching contract details..." />;
    //   }

    //   if (error) {
    //     return <p className="p-6 text-red-600">{String(error)}</p>;
    //   }

    return (
        <div className="min-h-screen bg-green-50 p-4">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm uppercase tracking-wide text-green-500">Contract ID</p>
                            <p className="text-lg font-semibold text-green-800">{contractId}</p>
                        </div>
                        <Link to="/contracts" className="text-sm font-semibold text-green-600 hover:text-green-800">
                            ← Back to contracts
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs uppercase text-green-500">Name</p>
                            <p className="text-base text-green-800">{contract?.contract_name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-green-500">Type</p>
                            <p className="text-base text-green-800">{contract?.contract_type}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md space-y-4">
                    {contract && Object.entries(contract).filter(([key, _]) => (key != 'user_id' && key != 'md_uri')).map(([key, value]) => (
                        <div key={key} className="p-4 bg-green-50 rounded-lg">
                            <p className="text-xs uppercase tracking-wide text-green-500 mb-1">{key}</p>
                            {renderValue(key, value)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContractDetail;
