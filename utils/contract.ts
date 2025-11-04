/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers, hexlify, parseEther } from "ethers";
import { getFheInstance, initializeFheInstance } from "./fheClient";
import { DropDisABI } from "./ABI";
import { Key } from "react";

export const getContract = async () => {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error(
      "MetaMask is not installed or not in a browser environment"
    );
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);

  const signer = await provider.getSigner();

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Contract address not provided in environment variables");
  }

  return new ethers.Contract(contractAddress, DropDisABI, signer);
};

export interface EmployeeData {
  id: Key | null | undefined;
  address: string;
  salary: number;
}

export const encryptEmployeeData = async (
  address: string,
  salary: number,
  progressCallback?: (step: number, message: string) => void
) => {
  try {
    progressCallback?.(1, "Initializing contract connection...");

    //  Get a contract instance to retrieve its address and signer.
    const contract = await getContract();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const signerAddress = await contract.getAddress();

    progressCallback?.(2, "Initializing encryption service...");

    // eslint-disable-next-line prefer-const
    let fhevmInstance = await getFheInstance();
    if (!fhevmInstance) {
      fhevmInstance = await initializeFheInstance();
    }

    progressCallback?.(3, "Encrypting wallet address...");

    // Encrypt the employee's address.
    const addressCiphertext = await fhevmInstance.createEncryptedInput(
      contractAddress,
      signerAddress
    );

    addressCiphertext.addAddress(address);

    const { handles: addressHandles, inputProof: addressProof } =
      await addressCiphertext.encrypt();

    progressCallback?.(4, "Encrypting salary amount...");

    const amountCiphertext = await fhevmInstance.createEncryptedInput(
      contractAddress,
      signerAddress
    );

    const amountInWei = parseEther(salary.toString());

    amountCiphertext.add64(BigInt(amountInWei));
    const { handles: amountHandles, inputProof: amountProof } =
      await amountCiphertext.encrypt();

    progressCallback?.(5, "Finalizing encryption...");

    return {
      encryptedAddress: hexlify(addressHandles[0]),
      encryptedAmount: hexlify(amountHandles[0]),
      addressProof: addressProof,
      amountProof: amountProof,
    };
  } catch (error:any) {
    console.error("Encryption failed for employee:",  error.message);

    // Re-throw a more user-friendly error to be caught by the UI.
    throw new Error(
      error.message
    );
  }
};

export async function switchToSepolia(progressCallback?: (message: string) => void) {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not detected");
  }

  const sepoliaChainId = "0xaa36a7";

  try {
    progressCallback?.("Switching to Sepolia testnet...");

    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: sepoliaChainId }],
    });

    progressCallback?.("Successfully connected to Sepolia testnet");
  } catch (error: any) {
    if (error.code === 4902) {
      progressCallback?.("Sepolia network not found. Adding network...");

      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: sepoliaChainId,
            chainName: "Ethereum Sepolia Testnet",
            nativeCurrency: {
              name: "Sepolia Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              "https://sepolia.infura.io/v3/531b54af7cd34bf3b2081ec8e462da35",
            ],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });

      progressCallback?.("Sepolia network added successfully");
    } else {
      console.error("Network switch failed:", error);
      throw error;
    }
  }
}

export const submitSalaryBatch = async (
  employeesData: any,
  setResponse: any,
  totalAmount: number
) => {
  try {
    setResponse(`Preparing transaction data...`);

    const contract = await getContract();

    setResponse(`Processing encrypted employee data...`);

    const encryptedAddresses = employeesData.encryptedAddresses.map(
      (item: any) => item?.data
    );
    const encryptedAmounts = employeesData.encryptedAmounts.map(
      (item: any) => item?.data
    );
    const addressProofs = employeesData.addressProofs.map(
      (item: any) => item?.data
    );
    const amountProofs = employeesData.amountProofs.map(
      (item: any) => item?.data
    );

    setResponse(`Connecting to Sepolia testnet...`);

    await switchToSepolia((message) => {
      setResponse(message);
    });

    setResponse(`Preparing transaction for ${employeesData.encryptedAddresses.length} employees...`);

    // Submit to contract
    const tx = await contract.submitSalaryBatch(
      encryptedAddresses,
      encryptedAmounts,
      addressProofs,
      amountProofs,
      {
        value: parseEther(totalAmount.toString()),
      }
    );

    setResponse(`Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`);
    setResponse(`Waiting for blockchain confirmation...`);

    const receipt = await tx.wait();

    console.log({receipt});

    setResponse(`Transaction confirmed! Processing batch details...`);

    // Extract batch ID from events
    const batchSubmittedEvent = receipt.events?.find(
      (e: any) => e.event === "SalaryBatchSubmitted"
    );
    const batchId = batchSubmittedEvent?.args?.batchId;

    setResponse(`Batch #${batchId?.toNumber()} created successfully!`);

    return {
      transactionHash: receipt?.transactionHash,
      batchId: batchId?.toNumber(),
    };
  } catch (error: any) {
    console.error("Batch submission failed:", error);
    setResponse(`Transaction failed: ${error.message}`);
    throw error;
  }
};

export const getBatchStatus = async (batchId: number) => {
  const contract = await getContract();
  const [isProcessed, addressDecrypted, amountDecrypted, totalAmount] =
    await contract.getBatchStatus(batchId);

  return {
    isProcessed,
    addressDecrypted,
    amountDecrypted,
    totalAmount: totalAmount.toNumber(),
  };
};

export const getDecryptedEmployee = async (
  batchId: number,
  employeeIndex: number
) => {
  const contract = await getContract();
  const [employeeAddress, salaryAmount] = await contract.getDecryptedEmployee(
    batchId,
    employeeIndex
  );

  return {
    employeeAddress,
    salaryAmount: salaryAmount.toNumber(),
  };
};
