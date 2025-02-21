// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BlindChaosSwarm.sol";

contract BlindChaosSwarmScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");
        vm.startBroadcast(deployerPrivateKey);

        BlindChaosSwarm swarm = new BlindChaosSwarm();

        vm.stopBroadcast();
    }
}
