import { useState } from "react";

import { parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePrepareContractWrite,
} from "wagmi";

import { connector } from "./";
import { useDebounce } from "./hooks/useDebounce";

function App() {
  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log("Connected", { address, connector, isReconnected });
    },
  });
  const { disconnect } = useDisconnect();
  const { connect, isLoading, error } = useConnect({
    connector: connector,
  });

  const [tokenId, setTokenId] = useState("");
  const debouncedTokenId = useDebounce(tokenId);

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    isSuccess,
    data,
  } = usePrepareContractWrite({
    address: account.address,
    abi: [
      {
        name: "mint",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ internalType: "uint32", name: "tokenId", type: "uint32" }],
        outputs: [{ name: "success", type: "bool" }],
      },
    ],
    functionName: "mint",
    args: [parseEther(debouncedTokenId)],
    enabled: Boolean(debouncedTokenId),
  });

  console.log(data, isSuccess);

  return (
    <>
      {account.isConnected ? (
        <>
          <h2>Connected Wallet: {account.address}</h2>
          <button onClick={disconnect}>Disconnect</button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label for="tokenId">Token ID</label>
            <input
              id="tokenId"
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="420"
              value={tokenId}
            />
            <button disabled={isLoading}>
              {isLoading ? "Minting..." : "Mint"}
            </button>
            {isSuccess && (
              <div>
                Successfully minted your NFT!
                <div>
                  <a href={`https://etherscan.io/tx/${data?.hash}`}>
                    Etherscan
                  </a>
                </div>
              </div>
            )}
            {isPrepareError && (
              <div>Error: {(prepareError || error)?.message}</div>
            )}
          </form>
        </>
      ) : (
        <>
          <button disabled={isLoading} onClick={connect}>
            {isLoading ? "Connecting..." : "Connect metamask"}
          </button>
        </>
      )}
    </>
  );
}

export default App;
