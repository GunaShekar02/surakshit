pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

contract Record {
  mapping (string => string[]) records;
  address owner;

  constructor() public{
    owner = msg.sender;
  }

  event RecordAdded(
    string recordHash
  );

  modifier uniqueRecord
    (string memory _recordHash, string memory _area) {
    for(uint i = 0; i<records[_area].length; ++i) {
      require(
        keccak256(bytes(records[_area][i])) != keccak256(bytes(_recordHash)),
        "This record already exists"
      );
    }
    _;
  }

  modifier onlyOfficial (address sender) {
    require(
      sender == owner,
      "Only officials may add records"
    );
    _;
  }

  function set
    (string memory _recordHash, string memory _area)
    public
    uniqueRecord(_recordHash, _area)

  {
    records[_area].push(_recordHash);
    emit RecordAdded(_recordHash);
  }

  function get(string memory _area)
    public
    view
    returns(string[] memory)
  {
    return records[_area];
  }
}