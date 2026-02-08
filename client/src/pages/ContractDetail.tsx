import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetContractWithoutValidation, useGetContract } from '@/queries/contracts';
import type { Contract, ContractBase } from "@/contract-schemas";
import ContractInfo from '@/components/ContractInfo';
import LoadingView from '@/components/LoadingView';
import ValidationComp from '@/components/ValidationComp';
import { QueryClient } from '@tanstack/react-query';


const ContractDetail: React.FC = () => {
    const queryClient = new QueryClient()
    const { contractId } = useParams<{ contractId?: string }>();
    const navigate = useNavigate()

    if (!contractId) {
        navigate("/contracts")
        return null
    }

    const [contract, setContract] = useState<Contract | ContractBase | null>(null);

    const { data, isLoading, error } = useGetContract(contractId);
    const getContractUnvalQuery = useGetContractWithoutValidation(contractId);

    useEffect(() => {
        if (error?.message === 'unauthorized') {
            queryClient.clear()
            navigate('/')
        }

        if(getContractUnvalQuery.error?.message === 'unauthorized') {
            queryClient.clear()
            navigate('/')
        }
    }, [error])



    useEffect(() => {
        if (data) {
            setContract({ ...data } as Contract);
        }

        if (error) {
            getContractUnvalQuery.refetch().then((val) => {
                console.log("Refetched contract without validation");
                setContract({ ...val.data } as ContractBase);

            }).catch((err) => {
                console.error("Error refetching contract without validation:", err);
                setContract(null);
            })
        }

    }, [data, error]);


    return (
        <div className="min-h-screen bg-green-50 p-4">
            <div className="max-w-5xl mx-auto space-y-6">
                {
                    isLoading && (<LoadingView message="Fetching contract details..." />)
                }
                {
                    error && (<p className="p-6 text-red-600">Error fetching contract details. {error.message}</p>)
                }
                {
                    contract && (<ContractInfo contract={contract} />)
                }
                {
                    contract && (<ValidationComp contract={contract} />)
                }

            </div>
        </div>
    );
};

export default ContractDetail;
