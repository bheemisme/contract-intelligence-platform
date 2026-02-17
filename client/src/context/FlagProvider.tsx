import { useState, type ReactNode } from "react";
import { FlagContext } from "@/context/FlagContext";
import type { FlagType } from "@/components/Flag";

export function FlagProvider({ children }: { children: ReactNode }) {
  const [showFlag, setShowFlag] = useState(false)
  const [flagMessage, setFlagMessage] = useState<string>("")
  const [flagType, setFlagType] = useState<FlagType>("info")
  const [hideFlag, setHideFlag] = useState(true)

  return (
    <FlagContext.Provider value={{ setShowFlag, showFlag, setFlagMessage, flagMessage, setFlagType, flagType, setHideFlag, hideFlag }}>
      {children}
    </FlagContext.Provider>
  );
}