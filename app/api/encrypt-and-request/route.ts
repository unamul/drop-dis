// app/api/encrypt-and-request/route.ts
import { NextResponse } from "next/server";
import { Wallet, JsonRpcProvider, Contract, AbiCoder } from "ethers";
import { encryptRecordWithZama } from "../../../lib/zama";

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_URL);
const signer = new Wallet(process.env.PRIVATE_KEY!, provider);

export async function POST(req: Request) {
  try {
    const { employees } = await req.json();
    // Example: employees = [{ address: "0x...", amount: 1000 }, ...]

    console.log({ employees });

    // Encrypt each record
    const encryptedBatch = [];
    for (const emp of employees) {
      const record = await encryptRecordWithZama(emp.address, emp.amount);
      encryptedBatch.push(record);
    }

    // Call smart contract to request decryption for the batch
    const contract = new Contract(
      process.env.NEXT_PUBLIC_SALARY_DISTRIBUTOR!,
      [
        "function requestDecryption(bytes[] calldata encryptedBatch) external returns (bool)",
      ],
      signer
    );

    const tx = await contract.requestDecryption(encryptedBatch);
    await tx.wait();

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (err: any) {
    console.error("❌ Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
