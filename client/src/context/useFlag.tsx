import { useContext } from "react";
import { FlagContext } from "@/context/FlagContext";

export function useFlag() {
  const ctx = useContext(FlagContext);

  if (!ctx) {
    throw new Error("useFlag must be used inside FlagProvider");
  }

  return ctx;
}