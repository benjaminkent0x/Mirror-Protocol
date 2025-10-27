import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { MirrorProtocol, MirrorProtocol__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

const ACTION_ATTACK = 1;
const ACTION_DEFEND = 2;
const ACTION_SCOUT = 3;

const OUTCOME_NONE = 0;
const OUTCOME_FAIL = 1;
const OUTCOME_DEATH = 2;
const OUTCOME_SUCCESS = 3;

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("MirrorProtocol")) as MirrorProtocol__factory;
  const contract = (await factory.deploy()) as MirrorProtocol;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("MirrorProtocol", function () {
  let signers: Signers;
  let contract: MirrorProtocol;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  async function decryptUint32(value: string, signer: HardhatEthersSigner) {
    return fhevm.userDecryptEuint(FhevmType.euint32, value, contractAddress, signer);
  }

  async function performAction(action: number, roll: number, signer: HardhatEthersSigner) {
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signer.address)
      .add32(action)
      .add32(roll)
      .encrypt();

    await contract
      .connect(signer)
      .performAction(encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.inputProof);
  }

  it("registers a player automatically on first defend", async function () {
    await performAction(ACTION_DEFEND, 42, signers.alice);

    const scoreEncrypted = await contract.getEncryptedScore(signers.alice.address);
    const score = await decryptUint32(scoreEncrypted, signers.alice);
    expect(score).to.eq(0);

    const actionEncrypted = await contract.getEncryptedAction(signers.alice.address);
    const action = await decryptUint32(actionEncrypted, signers.alice);
    expect(action).to.eq(ACTION_DEFEND);

    const outcomeEncrypted = await contract.getEncryptedOutcome(signers.alice.address);
    const outcome = await decryptUint32(outcomeEncrypted, signers.alice);
    expect(outcome).to.eq(OUTCOME_NONE);

    const [aliveCipher, initialized] = await contract.getPlayerStatus(signers.alice.address);
    const alive = await decryptUint32(aliveCipher, signers.alice);
    expect(alive).to.eq(1);
    expect(initialized).to.eq(true);
  });

  it("awards 100 points on successful attack", async function () {
    await performAction(ACTION_ATTACK, 70, signers.alice);

    const scoreEncrypted = await contract.getEncryptedScore(signers.alice.address);
    const score = await decryptUint32(scoreEncrypted, signers.alice);
    expect(score).to.eq(100);

    const outcomeEncrypted = await contract.getEncryptedOutcome(signers.alice.address);
    const outcome = await decryptUint32(outcomeEncrypted, signers.alice);
    expect(outcome).to.eq(OUTCOME_SUCCESS);
  });

  it("records a failed attack without changing score", async function () {
    await performAction(ACTION_ATTACK, 10, signers.alice);

    const scoreEncrypted = await contract.getEncryptedScore(signers.alice.address);
    const score = await decryptUint32(scoreEncrypted, signers.alice);
    expect(score).to.eq(0);

    const outcomeEncrypted = await contract.getEncryptedOutcome(signers.alice.address);
    const outcome = await decryptUint32(outcomeEncrypted, signers.alice);
    expect(outcome).to.eq(OUTCOME_FAIL);

    const [aliveCipher] = await contract.getPlayerStatus(signers.alice.address);
    const alive = await decryptUint32(aliveCipher, signers.alice);
    expect(alive).to.eq(1);
  });

  it("marks the player dead on lethal attack", async function () {
    await performAction(ACTION_ATTACK, 55, signers.alice);

    const outcomeEncrypted = await contract.getEncryptedOutcome(signers.alice.address);
    const outcome = await decryptUint32(outcomeEncrypted, signers.alice);
    expect(outcome).to.eq(OUTCOME_DEATH);

    const encryptedScore = await contract.getEncryptedScore(signers.alice.address);
    const score = await decryptUint32(encryptedScore, signers.alice);
    expect(score).to.eq(0);

    const [aliveCipher] = await contract.getPlayerStatus(signers.alice.address);
    const alive = await decryptUint32(aliveCipher, signers.alice);
    expect(alive).to.eq(0);

    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(ACTION_SCOUT)
      .add32(15)
      .encrypt();

    await contract
      .connect(signers.alice)
      .performAction(encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.inputProof);

    const scoreAfter = await contract.getEncryptedScore(signers.alice.address);
    const clearScoreAfter = await decryptUint32(scoreAfter, signers.alice);
    expect(clearScoreAfter).to.eq(0);

    const outcomeAfter = await contract.getEncryptedOutcome(signers.alice.address);
    const clearOutcomeAfter = await decryptUint32(outcomeAfter, signers.alice);
    expect(clearOutcomeAfter).to.eq(OUTCOME_DEATH);
  });
});
