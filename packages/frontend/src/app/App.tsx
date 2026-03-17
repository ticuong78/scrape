import { ScraperInterface } from "./components/ScraperInterface";
import { TitleBar } from "./components/TitleBar";

export default function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TitleBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScraperInterface />
      </div>
    </div>
  );
}
