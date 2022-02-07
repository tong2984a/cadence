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

  let count = cli_config['cli_6a_mint_nft']['count']
  console.log(`\nMinting count:${count} ...`)

//  let marketContractAddress = config['deployed']['nftmarketaddress']
  let nftContractAddress = config['deployed']['nftaddress']
  //const Market = await hre.ethers.getContractFactory("NFTMarket")
  //const market = await Market.attach(marketContractAddress)
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.attach(nftContractAddress)

  const tokenURIHash = config['token']['tokenURI.json']['hash']
  let listingPrice = await nft.getListingPrice()
  console.log(`Listing price: ${parseInt(listingPrice) / 10**18}`)

  let tokenId
  let transaction
  let tx
  let event
  let totalSupply

  totalSupply = await nft.totalSupply()
  console.log(`Original Total Supply: ${totalSupply}`)
  for (let i = 0; i < count; i++) {
    transaction = await nft.connect(purchaser).createToken(
      tokenURIHash, { value: listingPrice }
    )
    tx = await transaction.wait()
    event = tx.events[0]
    tokenId = event.args['tokenId'].toNumber()
    console.log(`New tokenId: ${tokenId}`)
  }

  totalSupply = await nft.totalSupply()
  console.log(`New Total Supply: ${totalSupply}`)

  console.log("\ncli_6a_mint_nft completed successfully.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
