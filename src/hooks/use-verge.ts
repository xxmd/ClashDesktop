import useSWR from "swr";
import { getVergeConfig, patchVergeConfig } from "@/services/cmds";

export const useVerge = () => {
  const { data: verge, mutate: mutateVerge } = useSWR(
    "getVergeConfig",
    getVergeConfig
  );

  const patchVerge = async (value: Partial<IVergeConfig>) => {
    console.log("patchVerge")
    console.dir(value)
    await patchVergeConfig(value);
    mutateVerge();
  };

  return {
    verge,
    mutateVerge,
    patchVerge,
  };
};
