const Record = artifacts.require("Record");
require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Record", accounts => {
  let record;

  before(async () => {
    record = await Record.deployed();
  });

  describe("deployement", async () => {
    it("deploys successfully", async () => {
      const address = record.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe("storage", async () => {
    it("updates recordHash", async () => {
      let area = "wardha";
      let expectedResult = ["abc", "def"];
      await record.set("abc", area);
      await record.set("def", area);
      const result = await record.get(area);
      for (let i = 0; i < result.length; ++i) {
        assert.equal(result[i], expectedResult[i]);
      }
    });
  });
});
