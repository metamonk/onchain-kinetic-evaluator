"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Logo from "./Logo"
import { defaultLinks } from "@/config/nav";

export function Navbar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const { authenticated, user: privyUser, login, logout } = usePrivy();
	
	const handleAuth = async () => {
    if (authenticated) {
      await logout();
    } else {
      try {
        await login();
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="flex items-center w-8 h-8">
              <Logo />
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-center">
          <nav className="hidden md:flex items-center space-x-6">
            {defaultLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className={
                  pathname === link.href
                    ? "text-primary hover:text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                }
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount>
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/tracked-wallets">Tracked Wallets</Link>
                  </DropdownMenuItem>
                  <Button onClick={handleAuth}>
                    Log Out
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleAuth}>
                Log In
              </Button>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  {defaultLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className={
                        pathname === link.href
                          ? "text-primary hover:text-primary font-semibold"
                          : "text-muted-foreground hover:text-primary"
                      }
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar;