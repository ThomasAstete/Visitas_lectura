import React from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut } from 'lucide-react';
import { logout } from '../lib/api'; // <--- Importamos la función de cierre de sesión

const Sidebar = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'visitas', icon: Package, label: 'Visitas' },

  ];

  // Función para manejar la salida segura
  const handleLogout = () => {
    // Confirmación simple del navegador
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        logout(); // Esto borra la cookie y redirige al login
    }
  };

  return (
    <aside className="w-64 h-screen bg-surface border-r border-white/10 flex flex-col fixed left-0 top-0 z-50 backdrop-blur-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Visitas Empresas
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${currentView === item.id ? 'bg-primary/10 text-primary border border-primary/30 shadow-neon' : 'text-muted hover:bg-white/5 hover:text-text' }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'animate-pulse' : ''} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        {/* Aquí conectamos la función handleLogout */}
        <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full p-2 hover:bg-white/5 rounded-lg"
        >
            <LogOut size={20} /> Salir
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;