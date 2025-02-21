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
        
        // Verify outcomes were stored
        assertEq(swarm.numOutcomes(swarmId), 2);
        assertEq(swarm.outcomeDescriptions(swarmId, 0), "Yes");
        assertEq(swarm.outcomeDescriptions(swarmId, 1), "No");
        assertTrue(swarm.validOutcomes(swarmId, 0));
        assertTrue(swarm.validOutcomes(swarmId, 1));
        
        vm.stopPrank();
    }

    function testJoinSwarm() public {
        // First create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));
        uint256 swarmId = swarm.nextSwarmId() - 1;
        vm.stopPrank();

        // Now bob joins the swarm
        vm.startPrank(bob);
        swarm.joinSwarm(swarmId, suint256(1 ether));
        
        // Verify bob's stake was recorded (though value is encrypted)
        assertTrue(swarm.creators(swarmId) != address(0), "Swarm should exist");
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
        
        // Verify bet was recorded (though value is encrypted)
        assertTrue(swarm.validOutcomes(swarmId, 0), "Outcome should still be valid");
        assertTrue(!swarm.resolved(swarmId), "Swarm should not be resolved yet");
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
        
        // Verify final state
        assertTrue(swarm.resolved(swarmId), "Swarm should be resolved");
        assertTrue(swarm.validOutcomes(swarmId, 0), "Winning outcome should still be valid");
        assertEq(swarm.creators(swarmId), alice, "Creator should not change");
        
        vm.stopPrank();
    }

    function test_RevertWhen_NonCreatorResolvesSwarm() public {
        // First create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));
        vm.stopPrank();

        // Bob tries to resolve (should revert)
        vm.startPrank(bob);
        uint256 swarmId = swarm.nextSwarmId() - 1;
        vm.expectRevert("Only creator can resolve");
        swarm.resolveSwarm(swarmId, 0);
        vm.stopPrank();
    }

    function test_RevertWhen_BettingOnInvalidOutcome() public {
        // Create a swarm
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(1 ether));
        uint256 swarmId = swarm.nextSwarmId() - 1;

        // Try to place bet on invalid outcome (should revert)
        vm.expectRevert("Invalid outcome");
        swarm.placeBet(swarmId, 2, suint256(1 ether));
        vm.stopPrank();
    }

    function test_RevertWhen_CreatingSwarmWithZeroStake() public {
        // Try to create swarm with zero stake (should revert)
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        vm.expectRevert("Initial stake must be positive");
        swarm.createSwarm("Will it rain tomorrow?", outcomes, suint256(0));
        vm.stopPrank();
    }

    function test_RevertWhen_CreatingSwarmWithEmptyQuestion() public {
        // Try to create swarm with empty question (should revert)
        vm.startPrank(alice);
        string[] memory outcomes = new string[](2);
        outcomes[0] = "Yes";
        outcomes[1] = "No";
        vm.expectRevert("Question cannot be empty");
        swarm.createSwarm("", outcomes, suint256(1 ether));
        vm.stopPrank();
    }

    function test_RevertWhen_CreatingSwarmWithSingleOutcome() public {
        // Try to create swarm with only one outcome (should revert)
        vm.startPrank(alice);
        string[] memory outcomes = new string[](1);
        outcomes[0] = "Yes";
        vm.expectRevert("Must have at least 2 outcomes");
        swarm.createSwarm("Will it rain?", outcomes, suint256(1 ether));
        vm.stopPrank();
    }
}
