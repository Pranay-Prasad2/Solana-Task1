"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Connection, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Toaster } from "@/app/components/ui/sonner";
import { toast } from "sonner";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

export default function TransferPage() {
    const { publicKey, signTransaction } = useWallet();
    const [amount, setAmount] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [showUSD, setShowUSD] = useState(true);
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [isSending,setisSending] = useState(false);
    // console.log("dATA:",process.env.NEXT_PUBLIC_COINGECKO_API);
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
                const res = await fetch(COINGECKO_API);
                const data = await res.json();
                setSolPrice(data.solana.usd);
            } catch (err) {
                console.error("Error fetching SOL price", err);
            }
        };
        fetchPrice();
    }, []);

    const isValidSolAddress = (address: string) => {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    };

    const handleSend = async () => {
        setisSending(true);
        if (!publicKey) {
            toast.error("Connect your Phantom wallet first");
            setisSending(false);
            return;
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Enter a valid SOL amount");
            setisSending(false);
            return;
        }

        if (!isValidSolAddress(toAddress)) {
            toast.error("Invalid Solana wallet address");
            setisSending(false);
            return;
        }

        try {
            const connection = new Connection(
                process.env.NEXT_PUBLIC_HELIUS_RPC || "https://api.devnet.solana.com"
            );

            const fromPubkey = new PublicKey(publicKey.toBase58());
            const toPubkey = new PublicKey(toAddress);

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: Number(amount) * LAMPORTS_PER_SOL,
                })
            );

            transaction.feePayer = fromPubkey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            if (!signTransaction) {
                toast.error("Wallet does not support signing");
                return;
            }

            const signedTx = await signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(signature);

            toast.success(`Transaction sent! ✅ Sig: ${signature}`);
        } catch (err) {
            console.error(err);
            toast.error("Transaction failed ❌");
        }finally{
            setisSending(false);
        }
    };

    return (
        <div className="flex justify-center p-6">
            <Card className="w-[400px]">
                <CardContent className="p-6 space-y-6">
                    <h1 className="text-xl font-bold text-center"> Transfer SOL</h1>

                    <div className="space-y-2">
                        <Label>Amount (in SOL)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 0.1"
                        />
        
                    </div>

                    <div className="space-y-2">
                        <Label>To Wallet Address</Label>
                        <Input
                            type="text"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="Recipient address"
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                        <Switch checked={showUSD} onCheckedChange={setShowUSD} />
                        <Label>Show USD Value</Label>
                        </div>
                                        {showUSD && solPrice && amount && (
                            <p className="text-sm text-gray-500 mt-1">
                                ≈ ${(Number(amount) * solPrice).toFixed(2)} USD
                            </p>
                        )}
                    </div>

                    <Button className="w-full" onClick={handleSend} disabled={isSending}>
                        {isSending?"Sending...":"Send SOL"}
                    </Button>
                </CardContent>
            </Card>
            <Toaster position="bottom-center" />
        </div>
    );
}
