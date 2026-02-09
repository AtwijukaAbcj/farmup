import React from 'react';
import './Sidebar.css';

export function Sidebar({ role }) {
  const isFarmer = role === 'farmer';
  const isVendor = role === 'vendor' || role === 'seller';
  const isCustomer = role === 'customer' || role === 'user';
  const isAdmin = role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Dashboard</h3>
        <span className="role-badge">{role}</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h4>Main</h4>
          <SidebarLink icon="📊" label="Overview" />
          <SidebarLink icon="🛒" label="Marketplace" />
        </div>

        {isFarmer && (
          <div className="nav-section">
            <h4>Farming</h4>
            <SidebarLink icon="🌾" label="My Produce" />
            <SidebarLink icon="🌍" label="My Lands" />
            <SidebarLink icon="📋" label="Activities" />
            <SidebarLink icon="🐄" label="Animals" />
            <SidebarLink icon="📦" label="Orders" />
            <SidebarLink icon="💰" label="Loans" />
          </div>
        )}

        {isVendor && (
          <div className="nav-section">
            <h4>Business</h4>
            <SidebarLink icon="🔧" label="My Supplies" />
            <SidebarLink icon="📦" label="Sales" />
            <SidebarLink icon="📈" label="Analytics" />
          </div>
        )}

        {isCustomer && (
          <div className="nav-section">
            <h4>Shopping</h4>
            <SidebarLink icon="🛍️" label="My Orders" />
            <SidebarLink icon="⭐" label="Favorites" />
          </div>
        )}

        {isAdmin && (
          <div className="nav-section">
            <h4>Administration</h4>
            <SidebarLink icon="👥" label="Users" />
            <SidebarLink icon="👨‍🌾" label="Farmers" />
            <SidebarLink icon="💵" label="Loans" />
            <SidebarLink icon="📊" label="Reports" />
            <SidebarLink icon="⚙️" label="Settings" />
          </div>
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({ icon, label, active }) {
  return (
    <a href="#" className={`sidebar-link ${active ? 'active' : ''}`}>
      <span className="link-icon">{icon}</span>
      <span className="link-label">{label}</span>
    </a>
  );
}
