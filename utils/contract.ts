/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers, parseEther } from "ethers";
import { getFheInstance } from "./fheClient";
import { DropDisABI } from "./ABI";
import { Key } from "react";

export const getContract = async () => {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error(
      "MetaMask is not installed or not in a browser environment"
    );
  }

  // Ethers v6: Use BrowserProvider instead of Web3Provider
  const provider = new ethers.BrowserProvider((window as any).ethereum);

  // Ethers v6: getSigner() is now async
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

export const encryptEmployeeData = async (address: string, salary: number) => {
  // 1. Get a contract instance to retrieve its address and signer.
  const contract = await getContract();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const signerAddress = await contract.getAddress();
  const fhevmInstance = await getFheInstance();

  try {
    // 2. Encrypt the employee's address.
    // We create an encrypted input, specifying which contract can decrypt it and who is providing the input.
    const addressCiphertext = await fhevmInstance.createEncryptedInput(
      contractAddress,
      signerAddress
    );
    // Use .addAddress() for addresses. This is the correct FHE type.
    addressCiphertext.addAddress(address);
    // Encrypt the input, which returns the handle and the proof.
    const { handles: addressHandles, inputProof: addressProof } =
      await addressCiphertext.encrypt();

    // 3. Encrypt the employee's salary amount.
    const amountCiphertext = await fhevmInstance.createEncryptedInput(
      contractAddress,
      signerAddress
    );
    // Use .add64() for a 64-bit unsigned integer, suitable for salary amounts.
    amountCiphertext.add64(BigInt(salary));
    const { handles: amountHandles, inputProof: amountProof } =
      await amountCiphertext.encrypt();

    // 4. Return the encrypted data in a structured format.
    // The handles from the FHE library are Uint8Arrays. We convert them to hex strings
    // because the smart contract's `externalE...` types expect bytes32 strings.
    return {
      encryptedAddress: ethers.hexlify(addressHandles[0]),
      encryptedAmount: ethers.hexlify(amountHandles[0]),
      addressProof: addressProof,
      amountProof: amountProof,
    };
  } catch (error) {
    console.error("Encryption failed for employee:", address, error);
    // Re-throw a more user-friendly error to be caught by the UI.
    throw new Error(
      "Failed to encrypt employee data. Please check the console for details."
    );
  }
};

export const submitSalaryBatch = async (
  employeesData: any,
  setResponse: any,
  totalAmount: number
) => {
  const contract = await getContract();
  setResponse(`Waiting for confirmation....`);

  console.log({ employeesData });

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

  console.log({ amountProofs });

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

  const receipt = await tx.wait();

  // Extract batch ID from events
  const batchSubmittedEvent = receipt.events?.find(
    (e: any) => e.event === "SalaryBatchSubmitted"
  );
  const batchId = batchSubmittedEvent?.args?.batchId;

  return {
    transactionHash: receipt.transactionHash,
    batchId: batchId?.toNumber(),
  };
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
