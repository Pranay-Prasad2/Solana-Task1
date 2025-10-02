"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/app/components/ui/navigation-menu";
import { cn } from "@/lib/utils"; // shadcn helper

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Cosmo", href: "/cosmo" },
        { name: "Transfer", href: "/transfer" },
    ];

    return (
        <div className="w-full border-b bg-white shadow-sm">
            <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
                <h1 className="text-lg font-bold">Solana Task</h1>

                <NavigationMenu>
                    <NavigationMenuList className="flex gap-6">
                        {navItems.map((item) => (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-blue-100 hover:text-blue-700",
                                            pathname === item.href
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-700"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}
