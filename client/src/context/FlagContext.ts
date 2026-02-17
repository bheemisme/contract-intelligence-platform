import { createContext, type SetStateAction } from "react";
import type { FlagType } from "@/components/Flag";

type FlagContextType = {
  setShowFlag: React.Dispatch<SetStateAction<boolean>>;
  showFlag: boolean;
  setFlagMessage: React.Dispatch<SetStateAction<string>>;
  flagMessage: string;
  setFlagType: React.Dispatch<SetStateAction<FlagType>>;
  flagType: FlagType;
  setHideFlag: React.Dispatch<SetStateAction<boolean>>;
  hideFlag: boolean;
};

export const FlagContext = createContext<FlagContextType | undefined>(undefined);