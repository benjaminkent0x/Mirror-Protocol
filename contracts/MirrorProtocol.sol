// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Mirror Protocol Game
/// @notice Players submit encrypted actions and earn encrypted points.
contract MirrorProtocol is SepoliaConfig {
    enum Action {
        None,
        Attack,
        Defend,
        Scout
    }

    enum Outcome {
        None,
        Fail,
        Death,
        Success
    }

    struct PlayerState {
        euint32 score;
        euint32 lastAction;
        euint32 lastOutcome;
        euint32 alive;
        bool initialized;
    }

    mapping(address => PlayerState) private _playerStates;
    address[] private _players;

    event PlayerRegistered(address indexed player);
    event ActionProcessed(address indexed player, bytes32 actionCipher, bytes32 outcomeCipher);

    /// @dev Register a player if this is their first interaction.
    function register() external {
        PlayerState storage state = _playerStates[msg.sender];
        if (state.initialized) {
            return;
        }

        _initializePlayer(state, msg.sender);
    }

    /// @notice Submit an encrypted action for the current turn.
    /// @param encryptedAction Encrypted value representing the chosen action (1: attack, 2: defend, 3: scout).
    /// @param encryptedRoll Encrypted value representing a random integer between 0 and 99.
    /// @param inputProof Proof produced by the relayer for the encrypted input.
    function performAction(
        externalEuint32 encryptedAction,
        externalEuint32 encryptedRoll,
        bytes calldata inputProof
    ) external {
        PlayerState storage state = _playerStates[msg.sender];

        if (!state.initialized) {
            _initializePlayer(state, msg.sender);
        }

        euint32 action = FHE.fromExternal(encryptedAction, inputProof);
        euint32 roll = FHE.fromExternal(encryptedRoll, inputProof);

        ebool isAttack = FHE.eq(action, FHE.asEuint32(uint32(Action.Attack)));
        ebool isDefend = FHE.eq(action, FHE.asEuint32(uint32(Action.Defend)));
        ebool isScout = FHE.eq(action, FHE.asEuint32(uint32(Action.Scout)));

        ebool isValidAction = FHE.or(FHE.or(isAttack, isDefend), isScout);

        ebool belowFifty = FHE.lt(roll, FHE.asEuint32(50));
        ebool atLeastFifty = FHE.ge(roll, FHE.asEuint32(50));
        ebool belowSixty = FHE.lt(roll, FHE.asEuint32(60));
        ebool atLeastSixty = FHE.ge(roll, FHE.asEuint32(60));

        ebool attackFail = FHE.and(isAttack, belowFifty);
        ebool attackDeath = FHE.and(isAttack, FHE.and(atLeastFifty, belowSixty));
        ebool attackSuccess = FHE.and(isAttack, atLeastSixty);

        euint32 outcome = FHE.asEuint32(uint32(Outcome.None));
        outcome = FHE.select(attackFail, FHE.asEuint32(uint32(Outcome.Fail)), outcome);
        outcome = FHE.select(attackDeath, FHE.asEuint32(uint32(Outcome.Death)), outcome);
        outcome = FHE.select(attackSuccess, FHE.asEuint32(uint32(Outcome.Success)), outcome);

        euint32 updatedScore = FHE.select(
            attackSuccess,
            FHE.add(state.score, FHE.asEuint32(100)),
            state.score
        );

        ebool aliveFlag = FHE.eq(state.alive, FHE.asEuint32(1));

        updatedScore = FHE.select(aliveFlag, updatedScore, state.score);

        euint32 sanitizedAction = FHE.select(
            isValidAction,
            action,
            FHE.asEuint32(uint32(Action.None))
        );

        euint32 gatedAction = FHE.select(aliveFlag, sanitizedAction, state.lastAction);
        euint32 gatedOutcome = FHE.select(aliveFlag, outcome, state.lastOutcome);
        euint32 updatedAlive = FHE.select(attackDeath, FHE.asEuint32(0), state.alive);

        state.score = updatedScore;
        state.lastAction = gatedAction;
        state.lastOutcome = gatedOutcome;
        state.alive = updatedAlive;

        _syncAccess(state, msg.sender);

        emit ActionProcessed(msg.sender, euint32.unwrap(state.lastAction), euint32.unwrap(state.lastOutcome));
    }

    /// @notice Returns the encrypted score for a given player.
    function getEncryptedScore(address player) external view returns (euint32) {
        return _playerStates[player].score;
    }

    /// @notice Returns the encrypted last action for a given player.
    function getEncryptedAction(address player) external view returns (euint32) {
        return _playerStates[player].lastAction;
    }

    /// @notice Returns the encrypted last outcome for a given player.
    function getEncryptedOutcome(address player) external view returns (euint32) {
        return _playerStates[player].lastOutcome;
    }

    /// @notice Returns whether a player is alive and initialized.
    function getPlayerStatus(address player) external view returns (euint32 alive, bool initialized) {
        PlayerState storage state = _playerStates[player];
        return (state.alive, state.initialized);
    }

    /// @notice Returns the list of all registered players.
    function getPlayers() external view returns (address[] memory) {
        return _players;
    }

    function _initializePlayer(PlayerState storage state, address player) private {
        state.score = FHE.asEuint32(0);
        state.lastAction = FHE.asEuint32(uint32(Action.None));
        state.lastOutcome = FHE.asEuint32(uint32(Outcome.None));
        state.alive = FHE.asEuint32(1);
        state.initialized = true;

        _players.push(player);

        _syncAccess(state, player);

        emit PlayerRegistered(player);
    }

    function _syncAccess(PlayerState storage state, address player) private {
        FHE.allowThis(state.score);
        FHE.allow(state.score, player);

        FHE.allowThis(state.lastAction);
        FHE.allow(state.lastAction, player);

        FHE.allowThis(state.lastOutcome);
        FHE.allow(state.lastOutcome, player);

        FHE.allowThis(state.alive);
        FHE.allow(state.alive, player);
    }
}
