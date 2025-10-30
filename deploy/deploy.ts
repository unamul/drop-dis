/* eslint-disable @typescript-eslint/no-explicit-any */

const func: any = async function (hre: any | any) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedDropDis = await deploy("DropDis", {
    from: deployer,
    log: true,
  });

  console.log(`DropDis contract deployed:---`, deployedDropDis.address);
};

export default func;

func.id = "deploy_DropDis";
func.tags = ["DropDis"];
