"use client"

import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Logo from "./Logo"
import Wrapper from "./Wrapper"

export function Navbar() {
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
    <header className="sticky top-0 z-50 w-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto">
        <Wrapper className="justify-between">
          <Link href="/" className="flex items-center space-x-2 mr-0">
            <div className="flex items-center w-8 h-8">
              <Logo />
            </div>
          </Link>
          <div className="flex items-center justify-end space-x-2">
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
                    <Link href="/following">Following</Link>
                  </DropdownMenuItem>
                  <Button onClick={handleAuth} variant="destructive" className="w-full">
                    Log Out
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleAuth}>
                Log In
              </Button>
            )}
          </div>
        </Wrapper>
      </div>
    </header>
  )
}

export default Navbar;