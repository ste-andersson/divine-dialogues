import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sun className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Tema:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="flex items-center gap-2"
      >
        {theme === "light" ? (
          <>
            <Sun className="w-4 h-4" />
            <span className="text-xs">Ljust</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            <span className="text-xs">Mörkt</span>
          </>
        )}
      </Button>
    </div>
  );
};