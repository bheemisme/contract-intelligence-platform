import type { QueryClient } from "@tanstack/react-query";
import type { ContractBase } from "./contract-schemas";

const getContractName = (queryClient: QueryClient, contractId: string | undefined): string | undefined => {
  if (!contractId) return "No contract selected";
  const contracts: ContractBase[] | undefined = queryClient.getQueryData(['contracts'])
  if (!contracts) return "No contract selected";
  const contract = contracts.find(contract => contract.contract_id === contractId);
  return contract?.contract_name
}

export { getContractName }