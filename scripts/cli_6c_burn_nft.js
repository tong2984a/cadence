const config = require('../config.json')
const cli_config = require('../cli_config.json')
const { upgrades } = require('hardhat');
const hre = require("hardhat");

async function main() {
  let accounts = await ethers.getSigners()
  let owner = accounts[0]
  let owner_address = [owner.address.substr(0, 4), owner.address.substr(38, 4)].join('...')
  let purchaser = accounts[1]
  let purchaser_address = [purchaser.address.substr(0, 4), purchaser.address.substr(38, 4)].join('...')
  let beneficiary = accounts[2]
  let beneficiary_address = [beneficiary.address.substr(0, 4), beneficiary.address.substr(38, 4)].join('...')

  let tokenId = cli_config['cli_6c_burn_nft']['tokenId']
  console.log(`\nBurning tokenId:${tokenId} ...`)

  let nftContractAddress = config['deployed']['nftaddress']
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.attach(nftContractAddress)

  let totalSupply

  totalSupply = await nft.totalSupply()
  console.log(`Original Total Supply: ${totalSupply}`)

  await nft.connect(purchaser).burn(tokenId)
  console.log(`Burned tokenId: ${tokenId}`)

  totalSupply = await nft.totalSupply()
  console.log(`New Total Supply: ${totalSupply}`)

  console.log("\ncli_6c_burn_nft completed successfully.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
