import { useState } from 'react';
import { ethers } from 'ethers';

const FACTORY_ADDRESS = '0xbd1c60A0549098283036518b38BF234Baae25Dd0';
const FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
      { internalType: 'uint256', name: 'customTax', type: 'uint256' },
      { internalType: 'uint256', name: 'minLockDays', type: 'uint256' }
    ],
    name: 'launchToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'address', name: 'lpToken', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'unlockTime', type: 'uint256' }
    ],
    name: 'TokenLaunched',
    type: 'event'
  }
];

export default function App() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [tax, setTax] = useState('1');
  const [eth, setEth] = useState('0.01');
  const [days, setDays] = useState('10');
  const [status, setStatus] = useState('');
  const [tokenLaunched, setTokenLaunched] = useState(false);
  const [launchedTokenAddress, setLaunchedTokenAddress] = useState('');

  const handleLaunch = async () => {
    if (!window.ethereum) return alert('Install MetaMask');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

    try {
      setStatus('Sending transaction...');
      const tx = await factory.launchToken(
        name,
        symbol,
        ethers.parseUnits(supply, 18),
        parseInt(tax),
        parseInt(days),
        { value: ethers.parseEther(eth) }
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.topics[0] === factory.interface.getEventTopic('TokenLaunched'));
      if (event) {
        const parsed = factory.interface.parseLog(event);
        setLaunchedTokenAddress(parsed.args.token);
      }
      setStatus('✅ Token launched!');
      setTokenLaunched(true);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error occurred during execution');
    }
  };

  return (
    <div className="container" style={{ padding: '1rem', maxWidth: '500px', margin: 'auto' }}>
      <h1>🚀 RatPad Launch</h1>
      <input placeholder="Token Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Symbol" value={symbol} onChange={e => setSymbol(e.target.value)} />
      <input placeholder="Total Supply" value={supply} onChange={e => setSupply(e.target.value)} />
      <input placeholder="Custom Tax % (e.g. 3)" value={tax} onChange={e => setTax(e.target.value)} />
      <input placeholder="Lock Days (min 10)" value={days} onChange={e => setDays(e.target.value)} />
      <input placeholder="ETH for LP (e.g. 0.01)" value={eth} onChange={e => setEth(e.target.value)} />
      <button onClick={handleLaunch} style={{ marginTop: '10px' }}>Launch Token</button>
      <p>{status}</p>

      {tokenLaunched && (
        <div className="confirmation" style={{ marginTop: '1rem', background: '#e9ffe9', padding: '12px', border: '1px solid #8bc34a', borderRadius: '8px' }}>
          <h3>🎉 Token Launched!</h3>
          <p><strong>{name}</strong> ({symbol})</p>
          <a href={`https://basescan.org/address/${launchedTokenAddress}`} target="_blank" rel="noopener noreferrer">
            🔍 View on BaseScan
          </a>
        </div>
      )}
    </div>
  );
}
