// src/App.js
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Container, CssBaseline } from '@mui/material';
import Header from './components/layout/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import NotFound from './pages/NotFound';
import { useState } from 'react';

function App() {
  const [userInfo, setUserInfo] = useState(null);

  return (
    <>
      <CssBaseline />
      <Header userInfo={userInfo} setUserInfo={setUserInfo} />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<Login setUserInfo={setUserInfo} />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/post/:type" element={<PostItem userInfo={userInfo} />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
