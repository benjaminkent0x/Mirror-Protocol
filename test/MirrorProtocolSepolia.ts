import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { MirrorProtocol } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

const ACTION_ATTACK = 1;

const OUTCOME_SUCCESS = 3;

type Signers = {
  alice: HardhatEthersSigner;
};

describe("MirrorProtocolSepolia", function () {
  let signers: Signers;
  let contract: MirrorProtocol;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("MirrorProtocol");
      contractAddress = deployment.address;
      contract = (await ethers.getContractAt("MirrorProtocol", deployment.address)) as MirrorProtocol;
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("submits a successful attack", async function () {
    steps = 8;
    this.timeout(4 * 40000);

    progress("Encrypting action and roll...");
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(ACTION_ATTACK)
      .add32(70)
      .encrypt();

    progress("Calling performAction...");
    const tx = await contract
      .connect(signers.alice)
      .performAction(encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.inputProof);
    await tx.wait();

    progress("Fetching encrypted score...");
    const encryptedScore = await contract.getEncryptedScore(signers.alice.address);
    expect(encryptedScore).to.not.eq(ethers.ZeroHash);

    progress("Decrypting score...");
    const score = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedScore,
      contractAddress,
      signers.alice,
    );
    progress(`Score=${score}`);

    progress("Decrypting last outcome...");
    const encryptedOutcome = await contract.getEncryptedOutcome(signers.alice.address);
    const outcome = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedOutcome,
      contractAddress,
      signers.alice,
    );
    progress(`Outcome=${outcome}`);

    expect(score).to.eq(100);
    expect(outcome).to.eq(OUTCOME_SUCCESS);
  });
});
