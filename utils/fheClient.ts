/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
let fheInstance: any = null;

export async function initializeFheInstance() {
  const { initSDK, createInstance, SepoliaConfig } = await import(
    "@zama-fhe/relayer-sdk/bundle"
  );

  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error(
      "Ethereum provider not found. Please install MetaMask or connect a wallet."
    );
  }

  try {
    // Load the WASM runtime
    await initSDK();
  } catch (error) {
    console.log("✅ fixed cors issue");
    await initSDK({
      tfheParams: "/wasm/tfhe_bg.wasm",
      kmsParams: "/wasm/kms_lib_bg.wasm",
    });
  }

  const config = { ...SepoliaConfig };

  try {
    fheInstance = await createInstance(config);
    console.log("✅ FHEVM instance initialized.");
    return fheInstance;
  } catch (err) {
    console.error("❌ FHEVM instance creation failed:", err);
    throw err;
  }
}

export function getFheInstance() {
  // if (!fheInstance) {
  //   throw new Error(
  //     "FHE instance not initialized. Call initializeFheInstance() first."
  //   );
  // }
  return fheInstance;
}

// Decrypt a single encrypted value using the relayer
export async function decryptValue(encryptedHandle: string): Promise<number> {
  if (!fheInstance) {
    await initializeFheInstance();
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(encryptedHandle)) {
    throw new Error("Invalid ciphertext handle for decryption");
  }

  try {
    const values = await fheInstance.publicDecrypt([encryptedHandle]);
    return Number(values[encryptedHandle]);
  } catch (error: any) {
    if (
      error?.message?.includes("fetch") ||
      error?.message?.includes("NetworkError")
    ) {
      throw new Error(
        "Decryption service is temporarily unavailable. Please try again later."
      );
    }
    throw new Error(error?.message || "Unknown decryption error");
  }
}
