// import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
// import { useConnection } from "@solana/wallet-adapter-react";
import {
    // WalletDisconnectButton,
    WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
// import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { FC } from "react";

const SolanaWallet: FC = () => {
    // const { connection } = useConnection();
    // const { publicKey, sendTransaction } = useWallet();

    // const onClick = useCallback(async () => {
    //     if (!publicKey) throw new WalletNotConnectedError();

    //     // 890880 lamports as of 2022-09-01
    //     const lamports = await connection.getMinimumBalanceForRentExemption(0);

    //     const transaction = new Transaction().add(
    //         SystemProgram.transfer({
    //             fromPubkey: publicKey,
    //             toPubkey: Keypair.generate().publicKey,
    //             lamports,
    //         })
    //     );

    //     const {
    //         context: { slot: minContextSlot },
    //         value: { blockhash, lastValidBlockHeight },
    //     } = await connection.getLatestBlockhashAndContext();

    //     const signature = await sendTransaction(transaction, connection, {
    //         minContextSlot,
    //     });

    //     await connection.confirmTransaction({
    //         blockhash,
    //         lastValidBlockHeight,
    //         signature,
    //     });
    // }, [publicKey, sendTransaction, connection]);

    return (
        <>
            {/* <WalletDisconnectButton /> */}
            <WalletMultiButton />
            {/* <button
                onClick={onClick}
                // disabled={!publicKey}
            >
                Send SOL to a random address!
            </button> */}
        </>
    );
};

export { SolanaWallet as default };
