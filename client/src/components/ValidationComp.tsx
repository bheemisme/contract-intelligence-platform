import { useEffect, useState } from "react"
import { useValidateContract, useGetValidationReport } from "../queries/contracts"
import type { Contract, ContractBase, ValidationReport } from "../contract-schemas"
import { renderValue } from "./utils"

type ValidatingStatus = "none" | "validating" | "validated" | "error"
const ValidationComp: React.FC<{ contract: Contract | ContractBase }> = ({ contract }) => {

    const { data, isLoading, error } = useGetValidationReport(contract.contract_id)
    const queryClient = useValidateContract(contract.contract_id)

    const [report, setReport] = useState<ValidationReport | null>(null)
    const [isValidating, setIsValidating] = useState<ValidatingStatus>("none")

    const onClick = () => {
        setIsValidating("validating")
        queryClient.refetch().then((val) => {
            if (val.data) {
                setReport(val.data)
            }else{
                setReport(null)
            }
            setIsValidating("validated")
        }).catch(() => {
            setIsValidating("error")
        }).finally(() => {
            setIsValidating("none")
        })
    }

    useEffect(() => {
        if (data) {
            setReport(data)
        } else {
            setReport(null)
        }
    }, [data])

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