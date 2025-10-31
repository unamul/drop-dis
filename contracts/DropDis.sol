// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, euint64, externalEaddress, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
// import "hardhat/console.sol";

contract DropDis is SepoliaConfig {
    address public immutable owner;

    uint256 public constant MAX_BATCH_SIZE = 50;

    enum RequestKind {
        Unknown,
        Addresses,
        Amounts
    }

    struct EncryptedEmployee {
        eaddress addr;
        euint64 amount;
    }

    struct DecryptedEmployee {
        address employee;
        uint256 amount;
    }

    struct SalaryBatch {
        uint256 batchId;
        address submitter;
        uint256 employeeCount;
        uint256 totalAmount;
        uint256 deposit;
        bool isProcessed;
        bool addressesDecrypted;
        bool amountsDecrypted;
    }

    // --- Storage ---
    uint256 public nextBatchId = 1;

    // encrypted handles per-batch
    mapping(uint256 => mapping(uint256 => EncryptedEmployee))
        private encryptedEmployees;

    // decrypted employees stored as arrays to simplify iteration and reduce per-item storage complexity
    mapping(uint256 => DecryptedEmployee[]) private decryptedEmployees;

    mapping(uint256 => SalaryBatch) public salaryBatches;

    // request tracking
    mapping(uint256 => uint256) public requestIdToBatchId;
    mapping(uint256 => RequestKind) public requestKind;

    // failed transfers tracking (batchId => list of failed recipients with amounts)
    mapping(uint256 => address[]) public failedRecipients;
    mapping(uint256 => uint256[]) public failedAmounts;

    // --- Events ---
    event SalaryBatchSubmitted(
        uint256 indexed batchId,
        address indexed submitter,
        uint256 employeeCount,
        uint256 deposit
    );
    event DecryptionRequested(
        uint256 indexed batchId,
        uint256 requestId,
        RequestKind kind
    );
    event AddressesDecrypted(uint256 indexed batchId);
    event AmountsDecrypted(uint256 indexed batchId, uint256 totalAmount);
    event SalaryDistributed(
        uint256 indexed batchId,
        address indexed employee,
        uint256 amount
    );
    event SalaryTransferFailed(
        uint256 indexed batchId,
        address indexed employee,
        uint256 amount
    );
    event BatchProcessed(
        uint256 indexed batchId,
        uint256 totalAmount,
        uint256 failedCount
    );
    event OwnerWithdrawal(address indexed owner, uint256 amount);

    // simple reentrancy guard
    bool private _locked;
    modifier nonReentrant() {
        require(!_locked, "Reentrant");
        _locked = true;
        _;
        _locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitSalaryBatch(
        externalEaddress[] calldata encryptedAddresses,
        externalEuint64[] calldata encryptedAmounts,
        bytes[] calldata addressProofs,
        bytes[] calldata amountProofs
    ) external payable {
        uint256 len = encryptedAddresses.length;
        require(len == encryptedAmounts.length, "Length mismatch");
        require(len > 0 && len <= MAX_BATCH_SIZE, "Invalid batch size");

        uint256 batchId = nextBatchId++;

        SalaryBatch storage batch = salaryBatches[batchId];
        batch.batchId = batchId;
        batch.submitter = msg.sender;
        batch.employeeCount = len;
        batch.isProcessed = false;
        batch.addressesDecrypted = false;
        batch.amountsDecrypted = false;
        batch.deposit = msg.value;

        // store encrypted handles and grant transient permissions to this contract
        for (uint256 i = 0; i < len; ++i) {
            eaddress addr = FHE.fromExternal(
                encryptedAddresses[i],
                addressProofs[i]
            );
            euint64 amount = FHE.fromExternal(
                encryptedAmounts[i],
                amountProofs[i]
            );

            encryptedEmployees[batchId][i] = EncryptedEmployee({
                addr: addr,
                amount: amount
            });

            FHE.allowThis(addr);
            FHE.allowThis(amount);
        }

        emit SalaryBatchSubmitted(batchId, msg.sender, len, msg.value);

        _startDecryptionProcess(batchId);
    }

    receive() external payable {}

    // Owner: withdraw any excess ETH not reserved for pending batches
    function withdrawExcess() external onlyOwner nonReentrant {
        uint256 reserved = _totalReserved();
        uint256 bal = address(this).balance;
        require(bal > reserved, "No excess balance");
        uint256 amount = bal - reserved;
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "Withdraw failed");
        emit OwnerWithdrawal(owner, amount);
    }

    // --- View helpers ---

    function getDecryptedEmployee(
        uint256 batchId,
        uint256 idx
    ) external view returns (address employee, uint256 amount) {
        require(
            salaryBatches[batchId].addressesDecrypted &&
                salaryBatches[batchId].amountsDecrypted,
            "Not decrypted"
        );
        DecryptedEmployee[] storage arr = decryptedEmployees[batchId];
        require(idx < arr.length, "Index OOB");
        DecryptedEmployee storage e = arr[idx];
        return (e.employee, e.amount);
    }

    function getFailedTransfers(
        uint256 batchId
    ) external view returns (address[] memory, uint256[] memory) {
        return (failedRecipients[batchId], failedAmounts[batchId]);
    }

    // --- Internal / FHE integration ---

    function _startDecryptionProcess(uint256 batchId) internal {
        uint256 len = salaryBatches[batchId].employeeCount;
        bytes32[] memory addrCts = new bytes32[](len);
        bytes32[] memory amtCts = new bytes32[](len);

        for (uint256 i = 0; i < len; ++i) {
            addrCts[i] = FHE.toBytes32(encryptedEmployees[batchId][i].addr);
            amtCts[i] = FHE.toBytes32(encryptedEmployees[batchId][i].amount);
        }

        uint256 addrReq = FHE.requestDecryption(
            addrCts,
            this.addressDecryptCallback.selector
        );
        requestIdToBatchId[addrReq] = batchId;
        requestKind[addrReq] = RequestKind.Addresses;
        emit DecryptionRequested(batchId, addrReq, RequestKind.Addresses);

        uint256 amtReq = FHE.requestDecryption(
            amtCts,
            this.amountDecryptCallback.selector
        );
        requestIdToBatchId[amtReq] = batchId;
        requestKind[amtReq] = RequestKind.Amounts;
        emit DecryptionRequested(batchId, amtReq, RequestKind.Amounts);
    }

    // Callbacks invoked by the oracle; signatures checked inside
    function addressDecryptCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        uint256 batchId = requestIdToBatchId[requestId];
        require(batchId != 0, "Invalid request");

        address[] memory addrs = abi.decode(cleartexts, (address[]));
        uint256 len = addrs.length;

        // ensure the decryptedEmployees array has the appropriate size
        DecryptedEmployee[] storage arr = decryptedEmployees[batchId];
        if (arr.length == 0) {
            for (uint256 i = 0; i < len; ++i)
                arr.push(DecryptedEmployee({employee: addrs[i], amount: 0}));
        } else {
            for (uint256 i = 0; i < len; ++i) arr[i].employee = addrs[i];
        }

        salaryBatches[batchId].addressesDecrypted = true;
        emit AddressesDecrypted(batchId);

        _checkAndProcessBatch(batchId);
    }

    function amountDecryptCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);
        uint256 batchId = requestIdToBatchId[requestId];
        require(batchId != 0, "Invalid request");

        uint64[] memory amounts = abi.decode(cleartexts, (uint64[]));
        uint256 len = amounts.length;

        DecryptedEmployee[] storage arr = decryptedEmployees[batchId];
        uint256 total = 0;

        if (arr.length == 0) {
            // addresses not decrypted yet: create placeholders
            for (uint256 i = 0; i < len; ++i) {
                arr.push(
                    DecryptedEmployee({
                        employee: address(0),
                        amount: amounts[i]
                    })
                );
                total += amounts[i];
            }
        } else {
            for (uint256 i = 0; i < len; ++i) {
                arr[i].amount = amounts[i];
                total += amounts[i];
            }
        }

        salaryBatches[batchId].totalAmount = total;
        salaryBatches[batchId].amountsDecrypted = true;
        emit AmountsDecrypted(batchId, total);

        _checkAndProcessBatch(batchId);
    }

    function _checkAndProcessBatch(uint256 batchId) internal {
        SalaryBatch storage batch = salaryBatches[batchId];
        if (
            batch.addressesDecrypted &&
            batch.amountsDecrypted &&
            !batch.isProcessed
        ) {
            _processSalaryDistribution(batchId);
        }
    }

    function _processSalaryDistribution(uint256 batchId) internal nonReentrant {
        SalaryBatch storage batch = salaryBatches[batchId];
        require(!batch.isProcessed, "Already processed");

        uint256 total = batch.totalAmount;
        require(batch.deposit >= total, "Insufficient deposit for batch");

        // mark as processed early to avoid double-processing
        batch.isProcessed = true;

        DecryptedEmployee[] storage arr = decryptedEmployees[batchId];
        uint256 failed = 0;

        for (uint256 i = 0; i < arr.length; ++i) {
            address to = arr[i].employee;
            uint256 amount = arr[i].amount;

            if (to == address(0) || amount == 0) {
                // invalid entry - count as failed and continue
                failedRecipients[batchId].push(to);
                failedAmounts[batchId].push(amount);
                failed++;
                continue;
            }

            (bool ok, ) = payable(to).call{value: amount}("");
            if (ok) {
                emit SalaryDistributed(batchId, to, amount);
            } else {
                // record failure but do not revert entire batch
                failedRecipients[batchId].push(to);
                failedAmounts[batchId].push(amount);
                emit SalaryTransferFailed(batchId, to, amount);
                failed++;
            }
        }

        batch.deposit = 0;

        emit BatchProcessed(batchId, total, failed);
    }

    // compute total reserved deposits across all pending batches (gas-heavy if many batches)
    function _totalReserved() internal view returns (uint256 reserved) {
        uint256 curr = nextBatchId;
        for (uint256 i = 1; i < curr; ++i) {
            reserved += salaryBatches[i].deposit;
        }
    }
}
