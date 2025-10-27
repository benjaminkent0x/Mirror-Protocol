import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const CONTRACT_NAME = "MirrorProtocol";

task("task:address", "Prints the MirrorProtocol address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const deployment = await deployments.get(CONTRACT_NAME);

  console.log(`${CONTRACT_NAME} address is ${deployment.address}`);
});

task("task:perform", "Submit an encrypted action to MirrorProtocol")
  .addOptionalParam("address", "Optionally specify the MirrorProtocol contract address")
  .addParam("action", "Action code (1 attack, 2 defend, 3 scout)")
  .addParam("roll", "Random roll between 0 and 99")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const actionCode = parseInt(taskArguments.action, 10);
    if (![1, 2, 3].includes(actionCode)) {
      throw new Error("--action must be 1, 2, or 3");
    }

    const rollValue = parseInt(taskArguments.roll, 10);
    if (!Number.isInteger(rollValue) || rollValue < 0 || rollValue > 99) {
      throw new Error("--roll must be an integer between 0 and 99");
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get(CONTRACT_NAME);
    console.log(`${CONTRACT_NAME}: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add32(actionCode)
      .add32(rollValue)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .performAction(encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.inputProof);

    console.log(`Submitted action, tx hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction status: ${receipt?.status}`);
  });

task("task:decrypt-score", "Decrypt the caller's encrypted score")
  .addOptionalParam("address", "Optionally specify the MirrorProtocol contract address")
  .addOptionalParam("player", "Address of the player to inspect")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get(CONTRACT_NAME);
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const [signer] = await ethers.getSigners();
    const targetAddress = taskArguments.player ?? signer.address;

    const encryptedScore = await contract.getEncryptedScore(targetAddress);
    if (encryptedScore === ethers.ZeroHash) {
      console.log("Encrypted score not initialized");
      return;
    }

    const clearScore = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedScore,
      deployment.address,
      signer,
    );

    console.log(`Encrypted score: ${encryptedScore}`);
    console.log(`Decrypted score: ${clearScore}`);
  });

task("task:decrypt-state", "Decrypt the caller's last action and outcome")
  .addOptionalParam("address", "Optionally specify the MirrorProtocol contract address")
  .addOptionalParam("player", "Address of the player to inspect")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get(CONTRACT_NAME);
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const [signer] = await ethers.getSigners();
    const targetAddress = taskArguments.player ?? signer.address;

    const encryptedAction = await contract.getEncryptedAction(targetAddress);
    const encryptedOutcome = await contract.getEncryptedOutcome(targetAddress);

    const clearAction = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAction,
      deployment.address,
      signer,
    );

    const clearOutcome = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedOutcome,
      deployment.address,
      signer,
    );

    console.log(`Last action (encrypted): ${encryptedAction}`);
    console.log(`Last action (clear): ${clearAction}`);
    console.log(`Last outcome (encrypted): ${encryptedOutcome}`);
    console.log(`Last outcome (clear): ${clearOutcome}`);
  });
