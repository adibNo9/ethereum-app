import { useState } from "react";

import {
  erc20ABI,
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
  const [ethereumAddress, setEthereumAddress] = useState("");
  const debouncedTokenId = useDebounce(tokenId);

  const {
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
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        outputs: [],
      },
    ],
    functionName: "mint",
    args: [parseInt(debouncedTokenId)],
    enabled: Boolean(debouncedTokenId),
  });

  const {
    config: configTransfer,
    error: transferError,
    isError: isTransferError,
    isSuccess: isSuccessTransfer,
    data: transferData,
  } = usePrepareContractWrite({
    address: account.address,
    abi: erc20ABI,
    functionName: "transfer",
    args: [ethereumAddress, parseInt(debouncedTokenId)],
    enabled: Boolean(debouncedTokenId),
  });

  const {
    data: contractWriteData,
    error: errorContactWrite,
    isError,
    write,
  } = useContractWrite(configTransfer);

  const { isLoading: transactionIsLoading, isSuccess: transactionIsSuccess } =
    useWaitForTransaction({
      hash: transferData?.hash,
    });

  console.log(erc20ABI);

  console.log(
    transferError,
    isTransferError,
    isSuccessTransfer,
    contractWriteData,
    errorContactWrite,
    isError,
    write,
    transactionIsLoading,
    transactionIsSuccess
  );

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
            <label htmlFor="tokenId">Token ID</label>
            <input
              id="tokenId"
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="420"
              value={tokenId}
            />
            <button disabled={isLoading}>
              {isLoading ? "Minting..." : "Mint Tokens"}
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
          <hr />

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label htmlFor="ethereumAddress">
              recipient’s Ethereum address
            </label>
            <input
              id="ethereumAddress"
              onChange={(e) => setEthereumAddress(e.target.value)}
              placeholder="0xFBA3224..."
              value={ethereumAddress}
            />
            <button disabled={isLoading}>
              {isLoading ? "Transfer..." : "Transfer Tokens"}
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
