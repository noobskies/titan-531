import { useContext } from "react";
import { ProgramContext } from "../context/ProgramContext";

export function useProgram() {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("useProgram must be used within a ProgramProvider");
  }
  return context;
}
