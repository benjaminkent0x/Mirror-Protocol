import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedMirrorProtocol = await deploy("MirrorProtocol", {
    from: deployer,
    log: true,
  });

  console.log(`MirrorProtocol contract: `, deployedMirrorProtocol.address);
};
export default func;
func.id = "deploy_mirrorProtocol"; // id required to prevent reexecution
func.tags = ["MirrorProtocol"];
