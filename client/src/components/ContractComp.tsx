import type { ContractSchema } from "../schemas"

export const ContractComp = (contractSchema: ContractSchema) => {
    return <div className="">
        <p>{contractSchema.contract_id}</p>
        <p>{contractSchema.contract_type}</p>
        <p>{contractSchema.pdf_uri}</p>
        <p>{contractSchema.md_uri}</p>
        
    </div>
}