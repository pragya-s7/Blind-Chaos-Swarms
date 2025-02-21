// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/BlindChaosSwarm.sol";

contract BlindChaosSwarmTest is Test {
    BlindChaosSwarm swarm;
    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        swarm = new BlindChaosSwarm();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function testCreateSwarm() public {
        vm.startPrank(alice);
        
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        
        swarm.createSwarm(
            "Will it rain tomorrow?",
            outcomes,
            suint256(1 ether)
        );

        uint256 swarmId = swarm.nextSwarmId() - 1;
        assertEq(swarm.questions(swarmId), "Will it rain tomorrow?");
        assertEq(swarm.creators(swarmId), alice);
        assertEq(swarm.resolved(swarmId), false);
        
        vm.stopPrank();
    }

    function testJoinSwarm() public {
        // First create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        uint256 swarmId = swarm.nextSwarmId();
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));
        vm.stopPrank();

        // Now bob joins the swarm
        vm.startPrank(bob);
        swarm.joinSwarm(swarmId, suint256(1 ether));
        vm.stopPrank();
    }

    function testPlaceBet() public {
        // First create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));
        vm.stopPrank();

        // Bob places a bet
        vm.startPrank(bob);
        uint256 swarmId = swarm.nextSwarmId() - 1;
        swarm.placeBet(swarmId, 0, suint256(1 ether));
        vm.stopPrank();
    }

    function testResolveSwarm() public {
        // First create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));

        // Only creator can resolve
        uint256 swarmId = swarm.nextSwarmId() - 1;
        swarm.resolveSwarm(swarmId, 0);
        assertTrue(swarm.resolved(swarmId));
        
        vm.stopPrank();
    }

    function testFailNonCreatorResolve() public {
        // First create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));
        vm.stopPrank();

        // Bob tries to resolve (should fail)
        vm.startPrank(bob);
        uint256 swarmId = swarm.nextSwarmId() - 1;
        swarm.resolveSwarm(swarmId, 0);
        vm.stopPrank();
    }
}
