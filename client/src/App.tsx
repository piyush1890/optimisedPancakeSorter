import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Game from "@/pages/game";
import LevelSelect from "@/pages/level-select";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => {
        window.location.href = '/game/1';
        return null;
      }} />
      <Route path="/game/:id" component={Game} />
      <Route path="/levels" component={LevelSelect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;