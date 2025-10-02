"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";
import placeholderImage from "../../../public/placeholder.jpg";

type Token = {
    mint: string;
    name: string;
    symbol: string;
    logo: string;
};
export default function CosmoPage() {
    const [tokens, setTokens] = useState<Token[]>([]);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8080/connect";
        const ws = new WebSocket(wsUrl);

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                let logo = "";
                if (data.uri) {
                    try {
                        const res = await fetch(data.uri);
                        const meta = await res.json();
                        logo = meta.image || "";
                    } catch (e) {
                        console.error("Failed to fetch metadata:", e);
                    }
                }

                const token: Token = {
                    name: data.name,
                    symbol: data.symbol,
                    mint: data.mint,
                    logo,
                };

                setTokens((prev) => [token, ...prev]);
            } catch (err) {
                console.error("Error parsing token:", err);
            }
        };
        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };
        return () => {
            ws.close();
        };
    }, []);

    return (
        <div className="p-6 space-y-4 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold">Cosmo – Live Token Feed</h1>

            <ScrollArea className="h-[800px] w-[80%] rounded-md border p-4">

                {tokens.length === 0 ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-100" />
                                    <Skeleton className="h-3 w-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    tokens.map((token, index) => (
                        <Card key={index} className="mb-3">
                            <CardContent className="flex items-center gap-4 p-4">
                                <Image
                                    src={token.logo || placeholderImage}
                                    alt={token.name}
                                    width={50}
                                    height={50}
                                    unoptimized
                                    className="rounded-full border shadow-sm object-cover overflow-hidden"
                                    style={{minHeight:"50px",minWidth:"50px"}}
                                />
                                <div>
                                    <p className="font-semibold">
                                        {token.name} ({token.symbol})
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Mint: {token.mint.slice(0, 8)}...{token.mint.slice(-6)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )))}
            </ScrollArea>
        </div>
    );
}
