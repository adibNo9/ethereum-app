import { useState } from "react";

import {
  useAccount,
  useConnect,
  useContractWrite,
  useDisconnect,
  usePrepareContractWrite,
  useWaitForTransaction,
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
  } = usePrepareContractWrite({
    address: account.address,
    abi: [
      {
        name: "mint",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ internalType: "uint32", name: "tokenId", type: "uint32" }],
        outputs: [],
      },
    ],
    functionName: "mint",
    args: [parseInt(debouncedTokenId)],
    enabled: Boolean(debouncedTokenId),
  });
  const {
    data,
    error: errorContract,
    isError,
    write,
  } = useContractWrite(config);

  const { isLoading: isLoadingTransaction, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  console.log(data, "test", errorContract, isLoadingTransaction);

  return (
    <>
      {account.isConnected ? (
        <>
          <h2>Connected Wallet: {account.address}</h2>
          <button onClick={disconnect}>Disconnect</button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              write?.();
            }}
          >
            <label for="tokenId">Token ID</label>
            <input
              id="tokenId"
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="420"
              value={tokenId}
            />
            <button disabled={!write || isLoading}>
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
            {(isPrepareError || isError) && (
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
