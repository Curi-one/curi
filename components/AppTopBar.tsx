import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

type Props = {
  profileHref?: string;
};

export function AppTopBar({ profileHref = "/profile" }: Props) {
  return (
    <header className="app-shell flex items-center justify-between border-b border-border py-4">
      <Wordmark href="/today" />
      <nav className="flex items-center gap-1" aria-label="Account">
        <Link href="/progress" className="btn-ghost text-xs">
          Progress
        </Link>
        <Link href={profileHref} className="btn-ghost text-xs">
          Profile
        </Link>
      </nav>
    </header>
  );
}
