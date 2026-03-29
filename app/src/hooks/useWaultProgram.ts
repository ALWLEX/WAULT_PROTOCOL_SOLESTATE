"use client";

import { useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "@/lib/constants";
import idl from "@/lib/idl/wault.json";

export interface WaultProgram {
  program: Program | null;
  provider: AnchorProvider | null;
  programId: PublicKey;
  connected: boolean;
}

export function useWaultProgram(): WaultProgram {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const { program, provider } = useMemo(() => {
    if (!wallet) return { program: null, provider: null };

    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      });

      const program = new Program(idl as Idl, PROGRAM_ID, provider);

      return { program, provider };
    } catch (error) {
      console.error("Failed to initialize program:", error);
      return { program: null, provider: null };
    }
  }, [connection, wallet]);

  return {
    program,
    provider,
    programId: PROGRAM_ID,
    connected: !!wallet,
  };
}