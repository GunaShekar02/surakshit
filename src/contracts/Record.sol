pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;

contract Record {
  mapping (string => string[]) records;

  function set(string memory _recordHash, string memory _area) public {
    records[_area].push(_recordHash);
  }

  function get(string memory _area) public view returns(string[] memory) {
    return records[_area];
  }
}