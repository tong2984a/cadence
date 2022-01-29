// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract NFT is Initializable, ERC721URIStorageUpgradeable, UUPSUpgradeable, OwnableUpgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable {
  using StringsUpgradeable for uint256;
  using CountersUpgradeable for CountersUpgradeable.Counter;
  CountersUpgradeable.Counter private _tokenIds;

  // IPFS content hash of contract-level metadata
  string private _contractURIHash;

  address contractAddress;
  // Maximum amounts of mintable tokens
  uint256 public constant MAX_SUPPLY = 7777;

  // Create a new role identifier for the minter role
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() initializer {}

  function initialize(address marketplaceAddress,
    string memory name,
    string memory symbol) external initializer {
    __ERC721_init(name, symbol);
    __ERC721Enumerable_init();
    __ERC721URIStorage_init();
    __Ownable_init();
    __UUPSUpgradeable_init();
    contractAddress = marketplaceAddress;
    __AccessControl_init();
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _contractURIHash = '';
  }

	function _authorizeUpgrade(address) internal override onlyOwner {
    // in general, nothing needs to be done here, because this function
    // will not be called when deploying the contract. However, resetting
    // version to "1.0" ensures that downgrading via an upgrade is possible (although risky)
		//version = "2.0";
	}

  // The following functions are overrides required by Solidity.
  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal
    override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
  {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function _burn(uint256 tokenId) internal
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
  {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId) public view
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  /// @notice Informs callers that this contract supports ERC2981
  function supportsInterface(bytes4 interfaceId) public view
    override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable)
    returns (bool)
  {
    return interfaceId == type(IERC2981Upgradeable).interfaceId || super.supportsInterface(interfaceId);
  }

  /// @dev Add an account to the user role. Restricted to admins.
  function addMinter(address account)
    public virtual onlyOwner
  {
    grantRole(MINTER_ROLE, account);
  }

  /// @notice Returns all the tokens owned by an address
  /// @param _owner - the address to query
  /// @return ownerTokens - an array containing the ids of all tokens
  ///         owned by the address
  function tokensOfOwner(address _owner) external view
  returns(uint256[] memory ownerTokens ) {
    uint256 tokenCount = balanceOf(_owner);
    uint256[] memory result = new uint256[](tokenCount);

    if (tokenCount == 0) {
      return new uint256[](0);
    } else {
      for (uint256 i=0; i<tokenCount; i++) {
          result[i] = tokenOfOwnerByIndex(_owner, i);
      }
      return result;
    }
  }

  /**
   * @dev Only contract owner or token owner can burn
   */
  function burn(uint256 tokenId) external {
    // Check that the calling account has the minter role
    require(ownerOf(tokenId) == msg.sender, "Caller is not Owner");

    _burn(tokenId);
  }

  function createToken(
    string memory tokenURIHash
  ) external returns (uint256) {
    //the totalSupply function determines how many NFT's in total exist currently, excluding the burnt ones.
    require(totalSupply() <= MAX_SUPPLY, "All tokens minted");

    // Check that the calling account has the minter role
    //require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");

    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _safeMint(msg.sender, newItemId);
    string memory uri = string(abi.encodePacked('ipfs://', tokenURIHash));
    _setTokenURI(newItemId, uri);
    setApprovalForAll(contractAddress, true);
    return newItemId;
  }

  /**
   * @notice The IPFS URI of contract-level metadata.
   */
  function contractURI() public view returns (string memory) {
      return string(abi.encodePacked('ipfs://', _contractURIHash));
  }

  /**
   * @notice Set the _contractURIHash.
   * @dev Only callable by the owner.
   */
  function setContractURIHash(string memory newContractURIHash) external onlyOwner {
      _contractURIHash = newContractURIHash;
  }
}
