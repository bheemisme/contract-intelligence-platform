import { Link, useNavigate } from "react-router";
import type { Contract, ContractBase } from "../contract-schemas";
import { useFillContract } from "../queries/contracts";
import { useEffect, useState } from "react";
import { renderValue } from "../components/utils";
import { useQueryClient } from "@tanstack/react-query";


type FillingState = "none" | "filling" | "filled" | "error"

interface ContractInfoProps {
    contract: Contract | ContractBase
}

const ContractInfo: React.FC<ContractInfoProps> = ({ contract }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const fillContract = useFillContract(contract.contract_id);
    useEffect(() => {
        if (fillContract.error?.cause === 401) {
            queryClient.clear()

            navigate("/");
        }
    }, [fillContract.error])
    const [isFilling, setIsFilling] = useState<FillingState>("none")
    const onFillContract = () => {
        setIsFilling("filling")
        fillContract.mutate(contract.contract_id, {
            onSuccess: () => {
                setIsFilling("filled")
            },
            onError: () => {
                setIsFilling("error")
            }
        })
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-green-500">Contract ID</p>
                        <p className="text-lg font-semibold text-green-800">{contract.contract_id}</p>
                    </div>
                    <Link to="/contracts" className="text-sm font-semibold text-green-600 hover:text-green-800">
                        ← Back to contracts
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs uppercase text-green-500">Name</p>
                        <p className="text-base text-green-800">{contract.contract_name}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase text-green-500">Type</p>
                        <p className="text-base text-green-800">{contract.contract_type}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md space-y-6">

                {/* Add a button with name fill */}

                {
                    isFilling == "filling" ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <div className="flex flex-row space-x-4 items-center">
                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded" onClick={onFillContract}>
                                Extract Contract Details

                            </button>
                            {isFilling == "error" && <p className="text-red-500">error extracting contract</p>}
                        </div>

                    )
                }

                {contract && Object.entries(contract).filter(([key, _]) => (key != 'user_id' && key != 'md_uri')).map(([key, value]) => (
                    <div key={key} className="p-4 bg-green-50 rounded-lg">
                        <p className="text-xs uppercase tracking-wide text-green-500 mb-1">{key}</p>
                        {renderValue(key, value)}
                    </div>
                ))}
            </div>




        </>
    )
}


export default ContractInfo;