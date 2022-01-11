// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.10;

/// @title MultiSend
/// @author NotMuchToLearn
/// @notice Sends eth to multiple parties in one transaction
/// @dev Thanks to olegabr for the nice transfer logic
contract MultiSend {
    function multiTransfer(
        address payable[] calldata _addresses,
        uint256[] calldata _amounts
    ) external payable {
        require(
            _addresses.length == _amounts.length,
            "Number of recipients and amounts do not match"
        );
        require(_addresses.length < 65536);
        uint256 _value = msg.value;
        for (uint16 i; i < _addresses.length; i++) {
            // Rely on overflow reverting the txn
            _value = _value - _amounts[i];
            _addresses[i].call{value: _amounts[i]}("");
        }
    }
}
