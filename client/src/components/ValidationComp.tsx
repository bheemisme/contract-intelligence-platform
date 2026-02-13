import { useEffect, useState } from "react"
import { useValidateContract, useGetValidationReport } from "../queries/contracts"
import type { Contract, ContractBase, ValidationReport } from "../contract-schemas"
import { renderValue } from "./utils"
import { useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"

type ValidatingStatus = "none" | "validating" | "validated" | "error"

interface ValidationCompProps {
    contract: Contract | ContractBase
}

const ValidationComp: React.FC<ValidationCompProps> = ({ contract }) => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { data, isLoading, error } = useGetValidationReport(contract.contract_id)

    useEffect(() => {
        if (error?.cause == 401) {
            queryClient.clear()
            navigate("/")
        }
        if (data) {
            setReport(data)
        } else {
            setReport(null)
        }
    }, [error, data])


    const getValidateContract = useValidateContract(contract.contract_id)

    const [report, setReport] = useState<ValidationReport | null>(null)
    const [isValidating, setIsValidating] = useState<ValidatingStatus>("none")

    const onClick = () => {
        setIsValidating("validating")
        getValidateContract.mutate(undefined, {
            onSuccess: (data) => {
                if (data) {
                    setReport(data)
                } else {
                    setReport(null)
                }
                setIsValidating("validated")
            },
            onError: (error) => {
                if (error.cause == 401) {
                    queryClient.clear()
                    navigate("/")
                }
                setIsValidating("error")

            },
            onSettled: () => {
                setIsValidating("none")
            }
        })

    }



    return <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md space-y-4">

        <button onClick={onClick} disabled={isValidating === "validating"} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
            Validate
        </button>

        {
            isValidating === "validating" && (<div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>)
        }
        {
            isValidating === "error" && <p className="text-red-500">Error validating contract</p>
        }

        {
            error && <p className="text-red-500">Error fetching validation report for contract</p>
        }

        {
            isLoading && <p className="text-green-500">Loading validation report...</p>
        }
        <div>
            {report && Object.entries(report).filter(([key, _]) => (key != 'user_id' && key != 'md_uri')).map(([key, value]) => (
                <div key={key} className="p-4 bg-green-50 rounded-lg">
                    <p className="text-xs uppercase tracking-wide text-green-500 mb-1">{key}</p>
                    {renderValue(key, value)}
                </div>
            ))}
        </div>
    </div>
}


export default ValidationComp