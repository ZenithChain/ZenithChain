// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  ZenithBadge — Soulbound ERC-721 for Zenith Genesis Campaign
 * @notice Minimal soulbound (non-transferable) NFT badge with a mint cap.
 *         Deploy one instance per badge type (Pioneer, Genesis).
 *
 * Constructor parameters:
 *   _name        e.g. "Zenith Pioneer"
 *   _symbol      e.g. "ZPIO"
 *   _maxSupply   e.g. 1000 for Pioneer, 10000 for Genesis
 *   _tokenURI    Static metadata URI (e.g. ipfs://.../pioneer.json)
 *
 * Anyone can call `mint(address to)` and pay gas. The contract enforces:
 *   - One badge per address
 *   - Hard cap on totalSupply
 *   - Soulbound (no transfers)
 *
 * Off-chain eligibility (referrals, KYC, anti-sybil) is enforced by the Zenith
 * backend; the contract is intentionally permissionless so the campaign API
 * just signals to the user when they may submit a mint tx.
 */
contract ZenithBadge {
    string public name;
    string public symbol;
    string private _baseTokenURI;
    uint256 public immutable maxSupply;
    uint256 public totalSupply;
    address public immutable owner;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public tokenOf;
    mapping(address => bool) public hasMinted;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Minted(address indexed to, uint256 indexed tokenId);

    error AlreadyMinted();
    error MaxSupplyReached();
    error Soulbound();
    error NotOwner();

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _tokenURI
    ) {
        name = _name;
        symbol = _symbol;
        maxSupply = _maxSupply;
        _baseTokenURI = _tokenURI;
        owner = msg.sender;
    }

    function mint(address to) external payable returns (uint256 tokenId) {
        if (hasMinted[to]) revert AlreadyMinted();
        if (totalSupply >= maxSupply) revert MaxSupplyReached();
        tokenId = ++totalSupply;
        ownerOf[tokenId] = to;
        tokenOf[to] = tokenId;
        hasMinted[to] = true;
        emit Minted(to, tokenId);
        emit Transfer(address(0), to, tokenId);
    }

    function balanceOf(address account) external view returns (uint256) {
        return hasMinted[account] ? 1 : 0;
    }

    function tokenURI(uint256) external view returns (string memory) {
        return _baseTokenURI;
    }

    function setTokenURI(string calldata newURI) external {
        if (msg.sender != owner) revert NotOwner();
        _baseTokenURI = newURI;
    }

    // --- Soulbound: block all transfers/approvals ---
    function transferFrom(address, address, uint256) external pure { revert Soulbound(); }
    function safeTransferFrom(address, address, uint256) external pure { revert Soulbound(); }
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure { revert Soulbound(); }
    function approve(address, uint256) external pure { revert Soulbound(); }
    function setApprovalForAll(address, bool) external pure { revert Soulbound(); }
    function getApproved(uint256) external pure returns (address) { return address(0); }
    function isApprovedForAll(address, address) external pure returns (bool) { return false; }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd /*ERC721*/ || interfaceId == 0x01ffc9a7 /*ERC165*/;
    }
}
