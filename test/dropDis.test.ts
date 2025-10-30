import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { parseEther, ethers } from "ethers"; // Import ethers for hexlify
// FIX 1: Import SignerWithAddress from 'hardhat'
// import { SignerWithAddress } from "hardhat";
// FIX 2: This import will work after you run `npx hardhat compile`
// import { DropDis } from "../typechain-types";

describe("DropDis", function () {
  let contract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;
  let nonOwner: any;

  // Store both plaintext and generated encrypted data
  let plaintextAddresses: string[];
  let plaintextAmounts: bigint[];
  let encryptedAddresses: string[];
  let encryptedAmounts: string[];
  let addressProofs: string[];
  let amountProofs: string[];

  before(async function () {
    // Check FHEVM mock and initialize CLI
    if (!hre.fhevm.isMock) {
      throw new Error("Tests require FHEVM mock environment");
    }
    await hre.fhevm.initializeCLIApi();

    // Get signers once for all tests
    [owner, addr1, addr2, addr3, nonOwner] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy a fresh contract for each test
    const DropDis = await hre.ethers.getContractFactory("DropDis");
    contract = await DropDis.deploy();
    await contract.waitForDeployment();

    // --- Generate Real Encrypted Data ---
    const employees = [
      { address: addr1.address, salary: parseEther("1.0") },
      { address: addr2.address, salary: parseEther("0.5") },
      { address: addr3.address, salary: parseEther("1.5") },
    ];

    // Initialize arrays to hold the encrypted data
    plaintextAddresses = employees.map((e) => e.address);
    plaintextAmounts = employees.map((e) => e.salary);
    encryptedAddresses = [];
    encryptedAmounts = [];
    addressProofs = [];
    amountProofs = [];

    // Encrypt each employee's data using the FHEVM provider
    for (const employee of employees) {
      // Encrypt Address
      const addressInput = hre.fhevm.createEncryptedInput(
        await contract.getAddress(),
        owner.address // The transaction submitter is the one providing the input
      );
      addressInput.addAddress(employee.address);
      const addressEncrypted = await addressInput.encrypt();
      // FIX 3: Convert Uint8Array handle to a hex string
      encryptedAddresses.push(ethers.hexlify(addressEncrypted.handles[0]));
      addressProofs.push(addressEncrypted.inputProof);

      // Encrypt Amount
      const amountInput = hre.fhevm.createEncryptedInput(
        await contract.getAddress(),
        owner.address
      );
      amountInput.add64(employee.salary);
      const amountEncrypted = await amountInput.encrypt();
      // FIX 3: Convert Uint8Array handle to a hex string
      encryptedAmounts.push(ethers.hexlify(amountEncrypted.handles[0]));
      amountProofs.push(amountEncrypted.inputProof);
    }
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set nextBatchId to 1", async function () {
      expect(await contract.nextBatchId()).to.equal(1);
    });
  });

  describe("Submit Salary Batch", function () {
    const totalAmount = parseEther("3.0"); // 1.0 + 0.5 + 1.5 ETH

    it("Should submit a salary batch with valid encrypted data", async function () {
      const tx = await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      await expect(tx)
        .to.emit(contract, "SalaryBatchSubmitted")
        .withArgs(1, owner.address, 3);

      expect(await contract.nextBatchId()).to.equal(2);
    });

    it("Should reject if arrays have different lengths", async function () {
      await expect(
        contract.submitSalaryBatch(
          encryptedAddresses.slice(0, 2), // Only 2 addresses
          encryptedAmounts, // 3 amounts
          addressProofs,
          amountProofs,
          { value: parseEther("1.5") }
        )
      ).to.be.revertedWith("Arrays must have the same length");
    });

    it("Should reject if arrays are empty", async function () {
      await expect(
        contract.submitSalaryBatch([], [], [], [], {
          value: parseEther("0.1"),
        })
      ).to.be.revertedWith("Empty batch not allowed");
    });

    it("Should reject if batch size is too large", async function () {
      const largeAddresses = Array(51).fill(encryptedAddresses[0]);
      const largeAmounts = Array(51).fill(encryptedAmounts[0]);
      const largeAddressProofs = Array(51).fill(addressProofs[0]);
      const largeAmountProofs = Array(51).fill(amountProofs[0]);

      await expect(
        contract.submitSalaryBatch(
          largeAddresses,
          largeAmounts,
          largeAddressProofs,
          largeAmountProofs,
          { value: parseEther("51.0") }
        )
      ).to.be.revertedWith("Batch size too large");
    });
  });

  describe("Get Batch Status", function () {
    it("Should return correct status for a submitted batch", async function () {
      const totalAmount = parseEther("3.0");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      const [
        isProcessed,
        addressDecrypted,
        amountDecrypted,
        totalAmountResult,
      ] = await contract.getBatchStatus(1);

      console.log("objectttttttt", totalAmountResult);

      expect(isProcessed).to.be.false;
      expect(addressDecrypted).to.be.false;
      expect(amountDecrypted).to.be.false;
      expect(totalAmountResult).to.equal(BigInt(0));
    });

    // it("Should revert for non-existent batch", async function () {
    //   await expect(contract.getBatchStatus(999)).to.be.reverted;
    // });
  });

  describe("Get Decrypted Employee", function () {
    it("Should revert if data is not decrypted yet", async function () {
      const totalAmount = parseEther("3.0");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      await expect(contract.getDecryptedEmployee(1, 0)).to.be.revertedWith(
        "Data not decrypted yet"
      );
    });

    it("Should revert for invalid employee index", async function () {
      const totalAmount = parseEther("3.0");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      await expect(contract.getDecryptedEmployee(1, 999)).to.be.revertedWith(
        "Invalid employee index"
      );
    });
  });

  describe("Withdraw", function () {
    it("Should allow owner to withdraw funds", async function () {
      await owner.sendTransaction({
        to: await contract.getAddress(),
        value: parseEther("1.0"),
      });

      const initialBalance = await hre.ethers.provider.getBalance(
        owner.address
      );
      const tx = await contract.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await hre.ethers.provider.getBalance(owner.address);

      expect(finalBalance.add(gasUsed)).to.equal(
        initialBalance.add(parseEther("1.0"))
      );
    });

    it("Should reject if non-owner tries to withdraw", async function () {
      await expect(contract.connect(nonOwner).withdraw()).to.be.revertedWith(
        "Only owner can call this function"
      );
    });

    it("Should reject if contract has no funds", async function () {
      await expect(contract.withdraw()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });
  });

  describe("Decryption Process (Simulated)", function () {
    it("Should handle address decryption callback", async function () {
      const totalAmount = parseEther("3.0");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      // Simulate the address decryption callback with REAL plaintext data
      const cleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]"],
        [plaintextAddresses]
      );

      await contract.addressDecryptCallback(
        1, // Mock requestId
        cleartexts,
        "0x" // Mock decryption proof
      );

      const [, addressDecrypted, ,] = await contract.getBatchStatus(1);
      expect(addressDecrypted).to.be.true;
    });

    it("Should handle amount decryption callback", async function () {
      const totalAmount = parseEther("3.0");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      // Simulate the amount decryption callback with REAL plaintext data
      const cleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64[]"],
        [plaintextAmounts]
      );

      await contract.amountDecryptCallback(
        2, // Mock requestId
        cleartexts,
        "0x" // Mock decryption proof
      );

      const [, , amountDecrypted, totalAmountResult] =
        await contract.getBatchStatus(1);
      expect(amountDecrypted).to.be.true;
      expect(totalAmountResult).to.equal(Number(totalAmount));
    });

    it("Should process salary distribution after both callbacks", async function () {
      const totalAmount = parseEther("3.0");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      // Simulate address decryption
      const addressCleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]"],
        [plaintextAddresses]
      );
      await contract.addressDecryptCallback(1, addressCleartexts, "0x");

      // Simulate amount decryption
      const amountCleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64[]"],
        [plaintextAmounts]
      );
      await contract.amountDecryptCallback(2, amountCleartexts, "0x");

      // Check that the batch is processed
      const [isProcessed, , ,] = await contract.getBatchStatus(1);
      expect(isProcessed).to.be.true;

      // Check that the decrypted employee data is correct
      const [emp1Addr, emp1Amount] = await contract.getDecryptedEmployee(1, 0);
      const [emp2Addr, emp2Amount] = await contract.getDecryptedEmployee(1, 1);
      const [emp3Addr, emp3Amount] = await contract.getDecryptedEmployee(1, 2);

      expect(emp1Addr).to.equal(addr1.address);
      expect(emp1Amount).to.equal(Number(plaintextAmounts[0]));
      expect(emp2Addr).to.equal(addr2.address);
      expect(emp2Amount).to.equal(Number(plaintextAmounts[1]));
      expect(emp3Addr).to.equal(addr3.address);
      expect(emp3Amount).to.equal(Number(plaintextAmounts[2]));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle a batch with a single employee", async function () {
      const singleAddress = [encryptedAddresses[0]];
      const singleAmount = [encryptedAmounts[0]];
      const singleAddressProof = [addressProofs[0]];
      const singleAmountProof = [amountProofs[0]];

      const tx = await contract.submitSalaryBatch(
        singleAddress,
        singleAmount,
        singleAddressProof,
        singleAmountProof,
        { value: plaintextAmounts[0] }
      );

      await expect(tx)
        .to.emit(contract, "SalaryBatchSubmitted")
        .withArgs(1, owner.address, 1);
    });
  });
});
