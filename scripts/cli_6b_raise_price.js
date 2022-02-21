const config = require('../config.json')
const cli_config = require('../cli_config.json')
const { upgrades } = require('hardhat');
const hre = require("hardhat");

async function main() {
  let accounts = await ethers.getSigners()
  let owner = accounts[0]
  let owner_address = [owner.address.substr(0, 4), owner.address.substr(38, 4)].join('...')

  let new_price = cli_config['cli_6b_raise_price']['new_price']
  console.log(`\nRaising Price: ...`)

  let nftContractAddress = config['deployed']['nftaddress']
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

  listingPrice = ethers.utils.parseUnits(new_price, 'ether')
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
