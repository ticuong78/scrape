import { ScraperInterface } from './components/ScraperInterface';
import { TitleBar } from './components/TitleBar';

export default function App() {
  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <div className="flex-1 overflow-auto">
        <ScraperInterface />
      </div>
    </div>
  );
}