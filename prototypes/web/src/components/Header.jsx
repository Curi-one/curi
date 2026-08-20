import React from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header({ signedIn, user, alwaysShowBar, onLogo, onProfile, onSignIn, onSignUp }) {
  return (
    <header
      className={`sticky top-0 z-30 -mx-5 flex items-center justify-between bg-background/80 px-5 pb-3.5 pt-3 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-14 xl:px-14${alwaysShowBar ? " header-landing" : " md:hidden"}`}
    >
      <button type="button" className="relative inline-block px-2 py-1 transition-opacity hover:opacity-75" onClick={onLogo} aria-label="Curi">
        <span
          className="font-serif text-[19px] leading-none text-foreground"
          style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}
        >
          Cu<em className="italic">ri</em>
        </span>
        <span className="absolute left-2 right-2" style={{ bottom: 0, height: "3px", background: "#C1121F" }} aria-hidden />
      </button>

      {signedIn ? (
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onProfile} aria-label="Open profile">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSignIn}>
            <LogIn className="h-3.5 w-3.5" aria-hidden />
            Sign in
          </Button>
          <Button size="sm" onClick={onSignUp}>
            <UserPlus className="h-3.5 w-3.5" aria-hidden />
            Sign up
          </Button>
        </div>
      )}
    </header>
  );
}

export default Header;
