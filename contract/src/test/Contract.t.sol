// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import "ds-test/test.sol";
import "src/MultiSend.sol";

contract TestMultiSend is DSTest {
    MultiSend multisend;
    MultiSend multisend1;
    MultiSend multisend2;

    function setUp() public {
        multisend = new MultiSend();
        multisend1 = new MultiSend();
        multisend2 = new MultiSend();
    }

    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function testMultiSend() public {
        address payable[] memory addrs = new address payable[](3);
        uint256 preBalance = address(this).balance;
        emit log(uint2str(preBalance));
        addrs[0] = payable(address(0x13360D1eC441AB0F140783c95296A8c8e460D9cD));
        addrs[1] = payable(address(0xCE82D65314502CE39472a2442D4a2cbC4Cb9F293));
        addrs[2] = payable(address(0x5BDf397bB2912859Dbd8011F320a222f79A28d2E));
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1 wei;
        amounts[1] = 2 wei;
        amounts[2] = 3 wei;
        assertTrue(multisend.multiTransfer{value: 6}(addrs, amounts));
        uint256 postBalance = address(this).balance;
        assertEq(preBalance - 6 wei, postBalance);
        assertEq(
            address(0x13360D1eC441AB0F140783c95296A8c8e460D9cD).balance,
            1 wei
        );
        assertEq(
            address(0xCE82D65314502CE39472a2442D4a2cbC4Cb9F293).balance,
            2 wei
        );
        assertEq(
            address(0x5BDf397bB2912859Dbd8011F320a222f79A28d2E).balance,
            3 wei
        );
    }
}
