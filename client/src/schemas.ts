export type RenewalType = 'AUTOMATIC' | 'MANUAL' | 'NON_RENEWABLE'
export type ContractType = 'SUPPLIER_CONTRACT' | 'NDA_CONTRACT' | 'EMPLOYMENT_CONTRACT'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'INR'
export type PaymentMode = 'ELECTRONIC_BANK_TRANSFER' | 'CASH' | 'CHEQUE'
export type PaymentFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
export type PaymentType = 'ONE_TIME' | 'SUBSCRIPTION' | 'EMI'

export interface ContractFormSchema {
    contract_name?: string
    contract_type?: ContractType | string
    file?: File
}

export interface UserSchema {
    username: string
    email: string
}

export interface Address {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code?: string
    country: string
}

export interface Contact {
    name?: string
    email?: string
    phone?: string
}

export interface Party {
    legal_name: string
    address: Address
    primary_contact: Contact
    disclosing_party?: boolean
}

export interface PaymentTerms {
    currency: Currency
    due_period: number
    payment_mode: PaymentMode
    payment_freq: PaymentFrequency
    payment_type: PaymentType
}

export interface LegalCompliance {
    governing_laws: string[]
}

export interface ContractBase {
    user_id: string
    contract_id: string
    contract_name?: string
    contract_type?: ContractType
    pdf_uri?: string
    md_uri?: string
}

export interface ContractSchema extends ContractBase {
    contract_name: string
    contract_type: ContractType
    pdf_uri: string
    md_uri: string
}

export interface SupplierContract extends ContractBase {
    supplier: Party
    client: Party
    effective_date: string
    execution_date?: string
    expiration_date?: string | null
    renewal_type: RenewalType
    contract_term?: number
    payment_term: PaymentTerms
    legal_compliance: LegalCompliance
}

export interface NDAContract extends ContractBase {
    parties: Party[]
    effective_date: string
    expiration_date?: string | null
    contract_term?: number
    renewal_type: RenewalType
    legal_compliance: LegalCompliance
    confidentiality_clause: string
}

export interface CTC {
    currency: Currency
    base_salary: number
    house_allowance?: number
    medical_allowance?: number
    travel_allowance?: number
    performance_bonus?: number
    gratuity?: number
    provident_fund?: number
    total_ctc: number
}

export interface EmploymentContract extends ContractBase {
    employee: Party
    employer: Party
    effective_date: string
    expiration_date?: string | null
    contract_term?: number
    renewal_type: RenewalType
    legal_compliance: LegalCompliance
    job_title: string
    ctc: CTC
}
