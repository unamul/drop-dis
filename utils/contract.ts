/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers, parseEther } from "ethers";
import { getFheInstance } from "./fheClient";
import { DropDisABI } from "./ABI";

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
  address: string;
  salary: number;
}

// export const encryptEmployeeData = async (address: string, salary: number) => {
//   const contract = await getContract();
//   const contractAddress = contract.address;
//   const signerAddress = await contract.signer.getAddress();

//   // Encrypt address
//   const addressCiphertext = await createEncryptedInput(contractAddress, signerAddress);
//   addressCiphertext.add256(BigInt(address));
//   const { handles: addressHandles, inputProof: addressProof } = await addressCiphertext.encrypt();

//   // Encrypt amount
//   const amountCiphertext = await createEncryptedInput(contractAddress, signerAddress);
//   amountCiphertext.add64(BigInt(salary));
//   const { handles: amountHandles, inputProof: amountProof } = await amountCiphertext.encrypt();

//   return {
//     encryptedAddress: addressHandles[0],
//     encryptedAmount: amountHandles[0],
//     addressProof: addressProof,
//     amountProof: amountProof,
//   };
// };

export const submitSalaryBatch = async (
  employees: EmployeeData[],
  setResponse: any
) => {
  const contract = await getContract();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const signerAddress = await contract.getAddress();

  const fhevmInstance = await getFheInstance();

  // Encrypt employee data
  const encryptedAddresses: string[] = [];
  const encryptedAmounts: string[] = [];
  const addressProofs: string[] = [];
  const amountProofs: string[] = [];

  let totalAmount = 0;

  for (const employee of employees) {
    setResponse(
      `Start Encrypting for... address=${employee?.address?.slice(
        0,
        5
      )}***${employee?.address?.slice(-4)}`
    );
    await new Promise((r) => setTimeout(r, 0));

    const addressCiphertext = await fhevmInstance.createEncryptedInput(
      contractAddress,
      signerAddress
    );
    // Convert address to a number and add it
    const addressAsNumber = employee.address;
    addressCiphertext.addAddress(addressAsNumber);
    const { handles: addressHandles, inputProof: addressProof } =
      await addressCiphertext.encrypt();

    // Create encrypted input for the salary amount
    const amountCiphertext = await fhevmInstance.createEncryptedInput(
      contractAddress,
      signerAddress
    );

    // Convert salary to a number and add it
    amountCiphertext.add64(
      BigInt(ethers.parseEther(employee?.salary.toString()))
    );
    const { handles: amountHandles, inputProof: amountProof } =
      await amountCiphertext.encrypt();

    encryptedAddresses.push(addressHandles[0]);
    encryptedAmounts.push(amountHandles[0]);
    addressProofs.push(addressProof);
    amountProofs.push(amountProof);

    totalAmount += employee.salary;
  }

  setResponse(`Waiting for confirmation....`);

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
