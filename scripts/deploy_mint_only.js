const cli_config = require('../cli_config.json')
const { upgrades } = require('hardhat')
const hre = require("hardhat")
const fs = require('fs')
const config = require('../config.json')

async function main () {
  let accounts = await ethers.getSigners()
  let owner = accounts[0]
  let admin = accounts[1]
  let beneficiary = accounts[2]

  let symbol = config['token']['symbol']
  let name = config['token']['name']
  let contractURIHash = config['token']['contractURI.json']['hash']

  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await upgrades.deployProxy(NFT, [beneficiary.address, name, symbol])
  await nft.deployed()
  await nft.setContractURIHash(contractURIHash)
  console.log("nft deployed to:", nft.address)

  let contract_owner = config['chains'][hre.network.name]['contract_owner']['address']
  let envChain = config['chains'][hre.network.name]['chain']

  //let nftmarketaddress = nftMarket.address
  let nftaddress = nft.address

  config['deployed'] = {
    //nftmarketaddress,
    nftaddress,
    envChain,
    contract_owner
  }

  fs.writeFileSync('config.json', JSON.stringify(config, null, 4))
}

main();
