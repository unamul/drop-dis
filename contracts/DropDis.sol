// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, euint64, externalEaddress, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract DropDis is SepoliaConfig {
    address public owner;

    struct EncryptedEmployee {
        eaddress employeeAddress;
        euint64 salaryAmount;
    }

    struct DecryptedEmployee {
        address employeeAddress;
        uint256 salaryAmount;
    }

    struct SalaryBatch {
        uint256 batchId;
        address submitter;
        uint256 totalAmount;
        uint256 employeeCount;
        bool isProcessed;
        bool addressDecrypted;
        bool amountDecrypted;
        mapping(uint256 => DecryptedEmployee) employees;
    }

    // Mapping from batch ID to salary batch
    mapping(uint256 => SalaryBatch) public salaryBatches;

    // Array of encrypted employees for each batch
    mapping(uint256 => EncryptedEmployee[]) public encryptedEmployees;

    // Counter for batch IDs
    uint256 public nextBatchId;

    // Events
    event SalaryBatchSubmitted(
        uint256 indexed batchId,
        address indexed submitter,
        uint256 employeeCount
    );
    event AddressesDecrypted(uint256 indexed batchId);
    event AmountsDecrypted(uint256 indexed batchId);
    event SalaryDistributed(
        uint256 indexed batchId,
        address indexed employee,
        uint256 amount
    );
    event BatchProcessed(uint256 indexed batchId, uint256 totalAmount);

    constructor() {
        owner = msg.sender;
        nextBatchId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Submit a batch of encrypted employee data for salary distribution

    function submitSalaryBatch(
        externalEaddress[] calldata encryptedAddresses,
        externalEuint64[] calldata encryptedAmounts,
        bytes[] calldata addressProofs,
        bytes[] calldata amountProofs
    ) external payable {
        require(
            encryptedAddresses.length == encryptedAmounts.length,
            "Arrays must have the same length"
        );
        require(encryptedAddresses.length > 0, "Empty batch not allowed");
        require(encryptedAddresses.length <= 50, "Batch size too large"); // limit for gas

        uint256 batchId = nextBatchId++;
        SalaryBatch storage batch = salaryBatches[batchId];
        batch.batchId = batchId;
        batch.submitter = msg.sender;
        batch.employeeCount = encryptedAddresses.length;
        batch.isProcessed = false;
        batch.addressDecrypted = false;
        batch.amountDecrypted = false;

        // Store encrypted data
        for (uint256 i = 0; i < encryptedAddresses.length; i++) {
            eaddress addr = FHE.fromExternal(
                encryptedAddresses[i],
                addressProofs[i]
            );
            euint64 amount = FHE.fromExternal(
                encryptedAmounts[i],
                amountProofs[i]
            );

            encryptedEmployees[batchId].push(
                EncryptedEmployee({employeeAddress: addr, salaryAmount: amount})
            );

            // Allow the contract to decrypt these values
            FHE.allowThis(addr);
            FHE.allowThis(amount);
        }

        emit SalaryBatchSubmitted(
            batchId,
            msg.sender,
            encryptedAddresses.length
        );

        // Start decryption process
        _startDecryptionProcess(batchId);
    }

    // Start the decryption process for a batch
    function _startDecryptionProcess(uint256 batchId) internal {
        // Prepare arrays for batch decryption
        bytes32[] memory addressCiphertexts = new bytes32[](
            encryptedEmployees[batchId].length
        );
        bytes32[] memory amountCiphertexts = new bytes32[](
            encryptedEmployees[batchId].length
        );

        for (uint256 i = 0; i < encryptedEmployees[batchId].length; i++) {
            addressCiphertexts[i] = FHE.toBytes32(
                encryptedEmployees[batchId][i].employeeAddress
            );
            amountCiphertexts[i] = FHE.toBytes32(
                encryptedEmployees[batchId][i].salaryAmount
            );
        }

        // Request decryption for addresses
        FHE.requestDecryption(
            addressCiphertexts,
            this.addressDecryptCallback.selector
        );

        // Request decryption for amounts
        FHE.requestDecryption(
            amountCiphertexts,
            this.amountDecryptCallback.selector
        );

        salaryBatches[batchId].batchId = batchId; // Using batchId as a temporary store for reqId
    }

    function addressDecryptCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Find the batch ID associated with this request
        uint256 batchId = _findBatchIdByRequestId(requestId);
        require(batchId > 0, "Invalid request ID");

        // Decode the addresses
        address[] memory decryptedAddresses = abi.decode(
            cleartexts,
            (address[])
        );

        // Store the decrypted addresses
        for (uint256 i = 0; i < decryptedAddresses.length; i++) {
            salaryBatches[batchId]
                .employees[i]
                .employeeAddress = decryptedAddresses[i];
        }

        // Mark addresses as decrypted
        salaryBatches[batchId].addressDecrypted = true;
        emit AddressesDecrypted(batchId);

        // Check if both addresses and amounts are decrypted
        _checkAndProcessBatch(batchId);
    }

    function amountDecryptCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Find the batch ID associated with this request
        uint256 batchId = _findBatchIdByRequestId(requestId);
        require(batchId > 0, "Invalid request ID");

        // Decode the amounts
        uint64[] memory decryptedAmounts = abi.decode(cleartexts, (uint64[]));

        // Store the decrypted amounts and calculate total
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < decryptedAmounts.length; i++) {
            salaryBatches[batchId].employees[i].salaryAmount = decryptedAmounts[
                i
            ];
            totalAmount += decryptedAmounts[i];
        }

        // Store the total amount
        salaryBatches[batchId].totalAmount = totalAmount;

        // Mark amounts as decrypted
        salaryBatches[batchId].amountDecrypted = true;
        emit AmountsDecrypted(batchId);

        // Check if both addresses and amounts are decrypted
        _checkAndProcessBatch(batchId);
    }

    function _checkAndProcessBatch(uint256 batchId) internal {
        SalaryBatch storage batch = salaryBatches[batchId];

        if (
            batch.addressDecrypted &&
            batch.amountDecrypted &&
            !batch.isProcessed
        ) {
            // Process the salary distribution
            _processSalaryDistribution(batchId);
        }
    }

    function _processSalaryDistribution(uint256 batchId) internal {
        SalaryBatch storage batch = salaryBatches[batchId];

        require(
            batch.totalAmount <= address(this).balance,
            "Insufficient contract balance"
        );

        // Distribute salaries
        for (uint256 i = 0; i < batch.employeeCount; i++) {
            address employee = batch.employees[i].employeeAddress;
            uint256 amount = batch.employees[i].salaryAmount;

            require(employee != address(0), "Invalid employee address");
            require(amount > 0, "Invalid salary amount");

            // Transfer the salary
            (bool success, ) = payable(employee).call{value: amount}("");
            require(success, "Salary transfer failed");

            emit SalaryDistributed(batchId, employee, amount);
        }

        // Mark the batch as processed
        batch.isProcessed = true;
        emit BatchProcessed(batchId, batch.totalAmount);
    }

    function _findBatchIdByRequestId(
        uint256 requestId
    ) internal view returns (uint256) {
        // In a real implementation, you would store the mapping from request ID to batch ID
        // For simplicity, we'll iterate through the batches
        for (uint256 i = 1; i < nextBatchId; i++) {
            if (salaryBatches[i].batchId == requestId) {
                return i;
            }
        }
        return 0;
    }

    // Withdraw contract balance (only owner)

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function getBatchStatus(
        uint256 batchId
    )
        external
        view
        returns (
            bool isProcessed,
            bool addressDecrypted,
            bool amountDecrypted,
            uint256 totalAmount
        )
    {
        SalaryBatch storage batch = salaryBatches[batchId];
        return (
            batch.isProcessed,
            batch.addressDecrypted,
            batch.amountDecrypted,
            batch.totalAmount
        );
    }

    function getDecryptedEmployee(
        uint256 batchId,
        uint256 employeeIndex
    ) external view returns (address employeeAddress, uint256 salaryAmount) {
        require(
            salaryBatches[batchId].addressDecrypted &&
                salaryBatches[batchId].amountDecrypted,
            "Data not decrypted yet"
        );
        require(
            employeeIndex < salaryBatches[batchId].employeeCount,
            "Invalid employee index"
        );

        DecryptedEmployee storage employee = salaryBatches[batchId].employees[
            employeeIndex
        ];
        return (employee.employeeAddress, employee.salaryAmount);
    }

    receive() external payable {}
}
