
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';

export default function App() {
  const [page, setPage] = useState('login');
  const toast = useToast();

  return (
    <>
      <Toast toasts={toast.toasts} remove={toast.remove} />
      {page === 'login'     && <LoginPage     onEnter={() => setPage('dashboard')} />}
      {page === 'dashboard' && <DashboardPage onMenu={() => setPage('menu')} toast={toast} />}
      {page === 'menu'      && <MenuPage      onBack={() => setPage('dashboard')} />}
    </>
  );
}
