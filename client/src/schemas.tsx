
export interface ContractFormSchema {
    contract_type?: string
    file?: File
}

export interface ContractSchema {
    contract_id: string,
    contract_type: string,
    pdf_uri: string,
    md_uri: string
}