import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/views/Dashboard';
import Players from './components/views/Players';
import Teams from './components/views/Teams';
import MatchTracker from './components/views/MatchTracker';
import Standings from './components/views/Standings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jugadores" element={<Players />} />
          <Route path="equipos" element={<Teams />} />
          <Route path="partido" element={<MatchTracker />} />
          <Route path="clasificacion" element={<Standings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
