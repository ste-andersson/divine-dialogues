
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CaseProvider } from "@/contexts/CaseContext";
import Index from "./pages/Index";
import Cases from "./pages/Cases";
import Checklist from "./pages/Checklist";
import Files from "./pages/Files";
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetails";
import AdminDefects from "./pages/AdminDefects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <CaseProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Cases />} />
              <Route path="/assistant" element={<Index />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/files" element={<Files />} />
              <Route path="/project-details/:conversationId" element={<ProjectDetails />} />
              <Route path="/admin-defects" element={<AdminDefects />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CaseProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
