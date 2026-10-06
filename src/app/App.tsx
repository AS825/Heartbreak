import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '../store/userStore';
import Layout from './Layout';
import Welcome from '../screens/Welcome';
import Onboarding from '../screens/Onboarding';
import Today from '../screens/Today';
import Checkin from '../screens/Checkin';
import ExerciseScreen from '../screens/ExerciseScreen';
import Garden from '../screens/Garden';
import Path from '../screens/Path';
import WorkshopScreen from '../screens/WorkshopScreen';
import Collection from '../screens/Collection';
import Abschluss from '../screens/Abschluss';

export default function App() {
  const onboarded = useStore((s) => s.onboarded);

  if (!onboarded) {
    return (
      <Layout bare>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/uebung/:id" element={<ExerciseScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Today />} />
        <Route path="/garten" element={<Garden />} />
        <Route path="/weg" element={<Path />} />
        <Route path="/sammlung" element={<Collection />} />
      </Route>
      <Route element={<Layout bare />}>
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/uebung/:id" element={<ExerciseScreen />} />
        <Route path="/werkstatt/:id" element={<WorkshopScreen />} />
        <Route path="/abschluss" element={<Abschluss />} />
        {/* Nach dem Onboarding landet der Reveal-Screen direkt in „Heute“ */}
        <Route path="/onboarding" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
