/**
 * REFERENCE FILE — Copy to apps/native/src/bridge/miner.ts
 * React Native bridge for the native MinerModule.
 */

import { NativeModules } from "react-native";

const { MinerModule } = NativeModules;

export const startMining = async (wallet: string, pool: string) => {
  return await MinerModule.startMining(wallet, pool);
};

export const stopMining = async () => {
  return await MinerModule.stopMining();
};
