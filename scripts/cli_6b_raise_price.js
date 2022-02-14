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

  console.log(`\nRaising Price: ...`)

//  let marketContractAddress = config['deployed']['nftmarketaddress']
  let nftContractAddress = config['deployed']['nftaddress']
  //const Market = await hre.ethers.getContractFactory("NFTMarket")
  //const market = await Market.attach(marketContractAddress)
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.attach(nftContractAddress)

  let listingPrice = await nft.getListingPrice()
  console.log(`Original Listing price: ${parseInt(listingPrice) / 10**18}`)

  let tokenId
  let transaction
  let tx
  let event

  transaction = await nft.connect(owner).incrementListingPrice()
  tx = await transaction.wait()
  event = tx.events[0]
  listingPrice = event.args['value']
  console.log(`Incrementing listing price by 0.01: ${parseInt(listingPrice) / 10**18}`)

  listingPrice = ethers.utils.parseUnits('0.3', 'ether')
  await nft.setListingPrice(listingPrice)

  listingPrice = await nft.getListingPrice()
  console.log(`Setting new listing price to: ${parseInt(listingPrice) / 10**18}`)

  console.log("\ncli_6b_raise_price completed successfully.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
