// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.10;

/// @title MultiSend
/// @author NotMuchToLearn
/// @notice Sends eth to multiple parties in one transaction
contract MultiSend {
    // From solmate SafeTransferLib
    function safeTransferETH(address to, uint256 amount) internal {
        bool callStatus;

        assembly {
            // Transfer the ETH and store if it succeeded or not.
            callStatus := call(gas(), to, amount, 0, 0, 0, 0)
        }

        require(callStatus, "ETH_TRANSFER_FAILED");
    }

    function multiTransfer(
        address payable[] calldata _addresses,
        uint256[] calldata _amounts
    ) external payable returns (bool) {
        require(
            _addresses.length == _amounts.length,
            "Number of recipients and amounts do not match"
        );
        require(_addresses.length != 0, "No recipients to send to");
        for (uint8 i; i < _addresses.length; i++) {
            safeTransferETH(_addresses[i], _amounts[i]);
        }
        return true;
    }
}
