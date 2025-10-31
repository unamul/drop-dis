/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { parseEther, ethers } from "ethers";

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
    if (!hre.fhevm.isMock) {
      throw new Error("Tests require FHEVM mock environment");
    }
    await hre.fhevm.initializeCLIApi();

    // Get signers once for all tests
    [owner, addr1, addr2, addr3, nonOwner] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const DropDis = await hre.ethers.getContractFactory("DropDis");
    contract = await DropDis.deploy();
    await contract.waitForDeployment();

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
      const addressInput = hre.fhevm.createEncryptedInput(
        await contract.getAddress(),
        owner.address
      );
      addressInput.addAddress(employee.address);
      const addressEncrypted: any = await addressInput.encrypt();
      encryptedAddresses.push(ethers.hexlify(addressEncrypted.handles[0]));
      addressProofs.push(addressEncrypted.inputProof);

      const amountInput = hre.fhevm.createEncryptedInput(
        await contract.getAddress(),
        owner.address
      );
      amountInput.add64(employee.salary);
      const amountEncrypted: any = await amountInput.encrypt();
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
    const totalAmount = parseEther("3.0");

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
        .withArgs(1, owner.address, 3, totalAmount);

      expect(await contract.nextBatchId()).to.equal(2);
    });

    it("Should reject if arrays have different lengths", async function () {
      await expect(
        contract.submitSalaryBatch(
          encryptedAddresses.slice(0, 2),
          encryptedAmounts,
          addressProofs,
          amountProofs,
          { value: parseEther("1.5") }
        )
      ).to.be.revertedWith("Length mismatch");
    });

    it("Should reject if arrays are empty", async function () {
      await expect(
        contract.submitSalaryBatch([], [], [], [], {
          value: parseEther("0.1"),
        })
      ).to.be.revertedWith("Invalid batch size");
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
      ).to.be.revertedWith("Invalid batch size");
    });
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
        "Not decrypted"
      );
    });
  });

  describe("Withdraw Excess", function () {
    it("Should allow owner to withdraw excess funds", async function () {
      await owner.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseUnits("1.0", "wei"),
      });

      const initialBalance = await hre.ethers.provider.getBalance(
        owner.address
      );
      const tx = await contract.withdrawExcess();
      const receipt = await tx.wait();

      const gasUsed: number = receipt.gasUsed * receipt.gasPrice;

      const finalBalance: any = await hre.ethers.provider.getBalance(
        owner.address
      );

      expect(finalBalance + gasUsed).to.equal(
        initialBalance + ethers.parseUnits("1.0", "wei")
      );
    });

    it("Should reject if non-owner tries to withdraw", async function () {
      await expect(
        contract.connect(nonOwner).withdrawExcess()
      ).to.be.revertedWith("Only owner");
    });

    it("Should reject if contract has no excess funds", async function () {
      await expect(contract.withdrawExcess()).to.be.revertedWith(
        "No excess balance"
      );
    });
  });

  // decryption -------
  describe("Decryption Process (Simulated)", function () {
    it("Should handle address decryption callback", async function () {
      const totalAmount = ethers.parseUnits("3.0", "wei");
      await contract.submitSalaryBatch(
        encryptedAddresses,
        encryptedAmounts,
        addressProofs,
        amountProofs,
        { value: totalAmount }
      );

      // Get the requestId from the DecryptionRequested event
      const filter = contract.filters.DecryptionRequested(1, null, null);
      const events = await contract.queryFilter(filter);
      const addressRequestEvent = events.find((e) => e.args?.kind === 0); // RequestKind.Addresses = 0
      const requestId = addressRequestEvent?.args?.requestId;

      // Simulate the address decryption callback with REAL plaintext data
      const cleartexts = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]"],
        [plaintextAddresses]
      );

      await contract.addressDecryptCallback(
        requestId,
        cleartexts,
        "0x" // Mock decryption proof
      );

      const batch = await contract.salaryBatches(1);
      expect(batch.addressesDecrypted).to.be.true;
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

      // Get the requestId from the DecryptionRequested event
      const filter = contract.filters.DecryptionRequested(1, null, null);
      const events = await contract.queryFilter(filter);
      const amountRequestEvent = events.find((e) => e.args?.kind === 1); // RequestKind.Amounts = 1
      const requestId = amountRequestEvent?.args?.requestId;

      // Simulate the amount decryption callback with REAL plaintext data
      const cleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64[]"],
        [plaintextAmounts.map((a) => Number(a))]
      );

      await contract.amountDecryptCallback(
        requestId,
        cleartexts,
        "0x" // Mock decryption proof
      );

      const batch = await contract.salaryBatches(1);
      expect(batch.amountsDecrypted).to.be.true;
      expect(batch.totalAmount).to.equal(totalAmount);
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

      // Get the requestIds from the DecryptionRequested events
      const filter = contract.filters.DecryptionRequested(1, null, null);
      const events = await contract.queryFilter(filter);
      const addressRequestEvent = events.find((e) => e.args?.kind === 0); // RequestKind.Addresses = 0
      const amountRequestEvent = events.find((e) => e.args?.kind === 1); // RequestKind.Amounts = 1
      const addressRequestId = addressRequestEvent?.args?.requestId;
      const amountRequestId = amountRequestEvent?.args?.requestId;

      // Simulate address decryption
      const addressCleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]"],
        [plaintextAddresses]
      );
      await contract.addressDecryptCallback(
        addressRequestId,
        addressCleartexts,
        "0x"
      );

      // Simulate amount decryption
      const amountCleartexts = hre.ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint64[]"],
        [plaintextAmounts.map((a) => Number(a))]
      );
      await contract.amountDecryptCallback(
        amountRequestId,
        amountCleartexts,
        "0x"
      );

      // Check that the batch is processed
      const batch = await contract.salaryBatches(1);
      expect(batch.isProcessed).to.be.true;

      // Check that the decrypted employee data is correct
      const [emp1Addr, emp1Amount] = await contract.getDecryptedEmployee(1, 0);
      const [emp2Addr, emp2Amount] = await contract.getDecryptedEmployee(1, 1);
      const [emp3Addr, emp3Amount] = await contract.getDecryptedEmployee(1, 2);

      expect(emp1Addr).to.equal(addr1.address);
      expect(emp1Amount).to.equal(plaintextAmounts[0]);
      expect(emp2Addr).to.equal(addr2.address);
      expect(emp2Amount).to.equal(plaintextAmounts[1]);
      expect(emp3Addr).to.equal(addr3.address);
      expect(emp3Amount).to.equal(plaintextAmounts[2]);
    });

    it("Should handle failed transfers", async function () {
      // Create a batch with an invalid address
      const invalidAddresses = [
        ethers.constants.AddressZero,
        addr2.address,
        addr3.address,
      ];

      // Encrypt the invalid address
      const addressInput = hre.fhevm.createEncryptedInput(
        await contract.getAddress(),
        owner.address
      );
      addressInput.addAddress(ethers.constants.AddressZero);
      const addressEncrypted = await addressInput.encrypt();
      const invalidEncryptedAddress = ethers.hexlify(
        addressEncrypted.handles[0]
      );
      const invalidAddressProof = addressEncrypted.inputProof;

      // Submit a new batch with invalid address
      const tx = await contract.submitSalaryBatch(
        [invalidEncryptedAddress, encryptedAddresses[1], encryptedAddresses[2]],
        [encryptedAmounts[0], encryptedAmounts[1], encryptedAmounts[2]],
        [invalidAddressProof, addressProofs[1], addressProofs[2]],
        [amountProofs[0], amountProofs[1], amountProofs[2]],
        { value: totalAmount }
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "SalaryBatchSubmitted"
      );
      const batchId = event?.args?.batchId;

      // Get the requestIds from the DecryptionRequested events
      const filter = contract.filters.DecryptionRequested(batchId, null, null);
      const events = await contract.queryFilter(filter);
      const addressRequestEvent = events.find((e) => e.args?.kind === 0); // RequestKind.Addresses = 0
      const amountRequestEvent = events.find((e) => e.args?.kind === 1); // RequestKind.Amounts = 1
      const addressRequestId = addressRequestEvent?.args?.requestId;
      const amountRequestId = amountRequestEvent?.args?.requestId;

      // Mock the address callback with invalid address
      await contract.addressDecryptCallback(
        addressRequestId,
        ethers.utils.defaultAbiCoder.encode(["address[]"], [invalidAddresses]),
        "0x" // Mock proof
      );

      // Mock the amount callback
      await contract.amountDecryptCallback(
        amountRequestId,
        ethers.utils.defaultAbiCoder.encode(
          ["uint64[]"],
          [plaintextAmounts.map((a) => Number(a))]
        ),
        "0x" // Mock proof
      );

      // Check failed transfers
      const [failedRecipients, failedAmounts] =
        await contract.getFailedTransfers(batchId);
      expect(failedRecipients[0]).to.equal(ethers.constants.AddressZero);
      expect(failedAmounts[0]).to.equal(plaintextAmounts[0]);
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
        .withArgs(1, owner.address, 1, plaintextAmounts[0]);
    });
  });
});
