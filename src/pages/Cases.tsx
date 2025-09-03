import { Navigation } from '@/components/Navigation';

const Cases = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-poppins font-extrabold mb-6 text-primary">
            Ärenden
          </h1>
          <p className="text-xl text-muted-foreground">
            Hantera och spåra tillsynsärenden
          </p>
        </header>
        
        <main className="flex justify-center">
          <div className="w-full max-w-4xl bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">
              Den här sidan kommer att innehålla ärendehantering för tillsyn.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Cases;