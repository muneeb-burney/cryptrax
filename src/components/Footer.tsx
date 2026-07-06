import { Github, Linkedin } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-glass-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          © {year} Cryptrax — Built by{" "}
          <span className="font-medium text-foreground">Muneeb Burney</span>
        </p>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/muneebburney"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/muneebburney"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
