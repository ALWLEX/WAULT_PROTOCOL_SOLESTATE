"use client";

import React, { createContext, useContext, useMemo } from "react";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import idl from "@/lib/idl/wault.json";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "WAULTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
);

interface ProgramContextType {
  program: Program | null;
  programId: PublicKey;
  provider: AnchorProvider | null;
}

const ProgramContext = createContext<ProgramContextType>({
  program: null,
  programId: PROGRAM_ID,
  provider: null,
});

export function ProgramProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const { program, provider } = useMemo(() => {
    if (!wallet) return { program: null, provider: null };

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    const program = new Program(idl as Idl, PROGRAM_ID, provider);

    return { program, provider };
  }, [connection, wallet]);

  return (
    <ProgramContext.Provider value={{ program, programId: PROGRAM_ID, provider }}>
      {children}
    </ProgramContext.Provider>
  );
}

export const useWaultProgram = () => useContext(ProgramContext);