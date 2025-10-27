"use client";
import ThemeToggle from "./theme-toggle";

const Header = () => {
  return (
    <header className="w-full border-b border bg-background p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Prac Digital BIM — Web3D</h1>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
