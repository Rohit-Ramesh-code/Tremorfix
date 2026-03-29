import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfileSelect from './pages/ProfileSelect';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PatientList from './pages/PatientList';
import Exercises from './pages/Exercises';
import Messages from './pages/Messages';
import ProfileMenu from './pages/ProfileMenu';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/profile/:profileId" element={<Dashboard />} />
        <Route path="/profile/:profileId/exercises" element={<Exercises />} />
        <Route path="/profile/:profileId/messages" element={<Messages />} />
        <Route path="/profile/:profileId/settings" element={<ProfileMenu />} />
      </Routes>
    </BrowserRouter>
  );
}
