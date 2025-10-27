import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { Contract, ethers } from 'ethers';
import { sepolia } from 'wagmi/chains';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/GameApp.css';

const ACTIONS = [
  {
    code: 1,
    label: 'Attack',
    description: '50% fail • 10% death • 40% +100 pts',
  },
  {
    code: 2,
    label: 'Defend',
    description: 'Hold position without score changes',
  },
  {
    code: 3,
    label: 'Scout',
    description: 'Gather intel and wait for next turn',
  },
];

const ACTION_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Attack',
  2: 'Defend',
  3: 'Scout',
};

const OUTCOME_LABELS: Record<number, string> = {
  0: 'No outcome yet',
  1: 'Attack failed',
  2: 'You died',
  3: 'Attack success (+100)',
};

type PlayerSnapshot = {
  score: number;
  lastAction: number;
  lastOutcome: number;
  alive: number;
  initialized: boolean;
};

const INITIAL_SNAPSHOT: PlayerSnapshot = {
  score: 0,
  lastAction: 0,
  lastOutcome: 0,
  alive: 1,
  initialized: false,
};

export function MirrorApp() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const signer = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [playerData, setPlayerData] = useState<PlayerSnapshot>(INITIAL_SNAPSHOT);
  const [players, setPlayers] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Connect your wallet to enter Mirror Protocol.');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [recentRoll, setRecentRoll] = useState<number | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const canInteract = useMemo(() => isConnected && !!address, [isConnected, address]);
  const isAlive = playerData.alive === 1;

  const decryptValues = useCallback(
    async (handles: string[]): Promise<Record<string, number>> => {
      if (!instance || !address) {
        return {};
      }

      const filteredHandles = handles.filter((handle) => handle !== ethers.ZeroHash);
      if (filteredHandles.length === 0) {
        return {};
      }

      const keypair = instance.generateKeypair();
      const contractAddresses = [CONTRACT_ADDRESS];
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';

      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);
      const resolvedSigner = await signer;
      if (!resolvedSigner) {
        throw new Error('Wallet signer is not available');
      }

      const signature = await resolvedSigner.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const handleContractPairs = filteredHandles.map((handle) => ({
        handle,
        contractAddress: CONTRACT_ADDRESS,
      }));

      const decrypted = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays,
      );

      const parsed: Record<string, number> = {};
      for (const handle of filteredHandles) {
        const value = decrypted[handle] ?? '0';
        parsed[handle] = Number(value);
      }
      return parsed;
    },
    [instance, signer, address],
  );

  const fetchPlayerData = useCallback(async () => {
    if (!publicClient || !address) {
      setPlayerData(INITIAL_SNAPSHOT);
      return;
    }

    setIsFetching(true);
    try {
      const [scoreCipher, actionCipher, outcomeCipher, statusTuple, allPlayers] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getEncryptedScore',
          args: [address],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getEncryptedAction',
          args: [address],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getEncryptedOutcome',
          args: [address],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPlayerStatus',
          args: [address],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPlayers',
        }),
      ]);

      const [aliveCipher, initializedFlag] = statusTuple as readonly [string, boolean];
      setPlayers(allPlayers as string[]);

      if (!instance || zamaLoading) {
        setPlayerData({
          score: 0,
          lastAction: 0,
          lastOutcome: 0,
          alive: 1,
          initialized: initializedFlag,
        });
        return;
      }

      const cipherHandles = [scoreCipher as string, actionCipher as string, outcomeCipher as string, aliveCipher as string];
      const decrypted = await decryptValues(cipherHandles);

      const score = scoreCipher === ethers.ZeroHash ? 0 : decrypted[scoreCipher as string] ?? 0;
      const actionValue = actionCipher === ethers.ZeroHash ? 0 : decrypted[actionCipher as string] ?? 0;
      const outcomeValue = outcomeCipher === ethers.ZeroHash ? 0 : decrypted[outcomeCipher as string] ?? 0;
      const aliveValue = aliveCipher === ethers.ZeroHash ? 1 : decrypted[aliveCipher as string] ?? 1;

      setPlayerData({
        score,
        lastAction: actionValue,
        lastOutcome: outcomeValue,
        alive: aliveValue,
        initialized: initializedFlag,
      });
      setStatusMessage('Encrypted intel synchronised.');
    } catch (error) {
      console.error('Failed to load player data:', error);
      setStatusMessage('Unable to load encrypted game data.');
    } finally {
      setIsFetching(false);
    }
  }, [address, publicClient, decryptValues, instance, zamaLoading]);

  useEffect(() => {
    if (canInteract) {
      fetchPlayerData();
    } else {
      setPlayerData(INITIAL_SNAPSHOT);
    }
  }, [canInteract, fetchPlayerData, refreshIndex]);

  const handleRegister = useCallback(async () => {
    if (!instance || !address) {
      setStatusMessage('Encryption service is still initialising.');
      return;
    }

    try {
      setActionLoading(true);
      setStatusMessage('Registering player...');
      const resolvedSigner = await signer;
      if (!resolvedSigner) {
        throw new Error('Wallet signer is not available');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, resolvedSigner);
      const tx = await contract.register();
      await tx.wait();

      setStatusMessage('Player registered successfully.');
      setRefreshIndex((value) => value + 1);
    } catch (error) {
      console.error('Failed to register player:', error);
      setStatusMessage(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  }, [instance, signer, address]);

  const handleAction = useCallback(
    async (actionCode: number) => {
      if (!instance || !address) {
        setStatusMessage('Encryption service is still initialising.');
        return;
      }

      if (!isAlive) {
        setStatusMessage('Your operative has fallen. No further actions are possible.');
        return;
      }

      try {
        setActionLoading(true);
        const resolvedSigner = await signer;
        if (!resolvedSigner) {
          throw new Error('Wallet signer is not available');
        }

        const roll = Math.floor(Math.random() * 100);
        setRecentRoll(roll);
        setStatusMessage(`Preparing encrypted order (${roll}% fate).`);

        const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
        input.add32(actionCode);
        input.add32(roll);
        const encrypted = await input.encrypt();

        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, resolvedSigner);
        const tx = await contract.performAction(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);
        setStatusMessage('Action dispatched. Waiting for confirmation...');
        await tx.wait();

        setStatusMessage('Action confirmed. Updating encrypted intel...');
        setRefreshIndex((value) => value + 1);
      } catch (error) {
        console.error('Failed to perform action:', error);
        setStatusMessage(error instanceof Error ? error.message : 'Action failed.');
      } finally {
        setActionLoading(false);
      }
    },
    [instance, signer, address, isAlive],
  );

  const formattedScore = useMemo(() => playerData.score.toString(), [playerData.score]);
  const lastActionLabel = ACTION_LABELS[playerData.lastAction] ?? 'Unknown';
  const lastOutcomeLabel = OUTCOME_LABELS[playerData.lastOutcome] ?? 'Unknown';

  const actionDisabled = !canInteract || zamaLoading || actionLoading || !instance;

  return (
    <div className="game-app">
      <header className="game-header">
        <div>
          <h1 className="game-title">Mirror Protocol</h1>
          <p className="game-subtitle">Encrypted tactical moves secured by Zama FHE</p>
        </div>
        <ConnectButton />
      </header>

      {zamaError ? (
        <div className="alert alert-error">{zamaError}</div>
      ) : null}

      <section className="status-panel">
        <div className="status-card">
          <h2 className="card-title">Operative Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Score</span>
              <span className="status-value">{formattedScore}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Alive</span>
              <span className={`status-tag ${isAlive ? 'status-ok' : 'status-bad'}`}>
                {isAlive ? 'Active' : 'Deceased'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Action</span>
              <span className="status-value">{lastActionLabel}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Outcome</span>
              <span className="status-value">{lastOutcomeLabel}</span>
            </div>
          </div>
          <div className="status-footer">
            <button
              className="ghost-button"
              onClick={() => setRefreshIndex((value) => value + 1)}
              disabled={!canInteract || isFetching}
            >
              {isFetching ? 'Refreshing...' : 'Refresh intel'}
            </button>
            <button
              className="ghost-button"
              onClick={handleRegister}
              disabled={!canInteract || actionLoading}
            >
              Register operative
            </button>
          </div>
        </div>

        <div className="status-card">
          <h2 className="card-title">Mission Log</h2>
          <p className="status-info">{statusMessage}</p>
          {recentRoll !== null ? (
            <p className="status-info">Latest battle roll: <strong>{recentRoll}</strong></p>
          ) : null}
          <p className="status-hint">Encrypted reads are refreshed whenever you deploy a new order.</p>
        </div>
      </section>

      <section className="actions-panel">
        <h2 className="card-title">Choose Your Next Order</h2>
        <div className="actions-grid">
          {ACTIONS.map((action) => (
            <button
              key={action.code}
              className="action-card"
              disabled={actionDisabled}
              onClick={() => handleAction(action.code)}
            >
              <div className="action-header">
                <span className="action-title">{action.label}</span>
                <span className="action-code">#{action.code}</span>
              </div>
              <p className="action-description">{action.description}</p>
            </button>
          ))}
        </div>
        <p className="panel-hint">
          Encryption requires a short setup. Please allow the Zama SDK to initialise before sending orders.
        </p>
      </section>

      <section className="roster-panel">
        <h2 className="card-title">Operative Roster</h2>
        {players.length === 0 ? (
          <p className="status-info">No operatives registered yet.</p>
        ) : (
          <ul className="player-list">
            {players.map((player) => (
              <li key={player} className="player-item">
                <span className="player-address">{player}</span>
                <span className="player-note">Scores remain encrypted to everyone but the owner.</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
