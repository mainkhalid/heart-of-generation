import React from 'react';
import { Outlet } from 'react-router-dom';
import {Navbar} from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

export default function UserDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main >
        <Outlet /> 
      </main>
      
      <Footer />
    </div>
  );
}
