import React, { useState } from 'react';
import './Sidebar.css';

export function Sidebar({ role, activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('overview');
  
  const isFarmer = role === 'farmer';
  const isVendor = role === 'vendor' || role === 'seller';
  const isCustomer = role === 'customer' || role === 'user';
  const isAdmin = role === 'admin';

  const handleItemClick = (item) => {
    setActiveItem(item);
    if (onNavigate) onNavigate(item);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">🌾</span>
          {!collapsed && <span className="brand-text">FarmUp</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <div className="user-profile">
        <div className="avatar">
          {role === 'farmer' && '👨‍🌾'}
          {role === 'vendor' && '🏪'}
          {(role === 'customer' || role === 'user') && '👤'}
          {role === 'admin' && '👑'}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">Dashboard</span>
            <span className="user-role">{role}</span>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <span className="nav-section-title">Main</span>}
          <SidebarLink 
            icon="📊" 
            label="Overview" 
            collapsed={collapsed}
            active={activeItem === 'overview'}
            onClick={() => handleItemClick('overview')}
          />
          <SidebarLink 
            icon="🛒" 
            label="Marketplace" 
            collapsed={collapsed}
            active={activeItem === 'marketplace'}
            onClick={() => handleItemClick('marketplace')}
          />
        </div>

        {isFarmer && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Farming</span>}
            <SidebarLink icon="🌾" label="My Produce" collapsed={collapsed} active={activeItem === 'produce'} onClick={() => handleItemClick('produce')} />
            <SidebarLink icon="🌍" label="My Lands" collapsed={collapsed} active={activeItem === 'lands'} onClick={() => handleItemClick('lands')} />
            <SidebarLink icon="📋" label="Activities" collapsed={collapsed} active={activeItem === 'activities'} onClick={() => handleItemClick('activities')} />
            <SidebarLink icon="🐄" label="Animals" collapsed={collapsed} active={activeItem === 'animals'} onClick={() => handleItemClick('animals')} />
            <SidebarLink icon="📦" label="Orders" collapsed={collapsed} active={activeItem === 'orders'} onClick={() => handleItemClick('orders')} />
            <SidebarLink icon="💰" label="Loans" collapsed={collapsed} active={activeItem === 'loans'} onClick={() => handleItemClick('loans')} />
          </div>
        )}

        {isVendor && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Business</span>}
            <SidebarLink icon="🔧" label="My Supplies" collapsed={collapsed} active={activeItem === 'supplies'} onClick={() => handleItemClick('supplies')} />
            <SidebarLink icon="📦" label="Sales" collapsed={collapsed} active={activeItem === 'sales'} onClick={() => handleItemClick('sales')} />
            <SidebarLink icon="📈" label="Analytics" collapsed={collapsed} active={activeItem === 'analytics'} onClick={() => handleItemClick('analytics')} />
          </div>
        )}

        {isCustomer && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Shopping</span>}
            <SidebarLink icon="🛍️" label="My Orders" collapsed={collapsed} active={activeItem === 'my-orders'} onClick={() => handleItemClick('my-orders')} />
            <SidebarLink icon="⭐" label="Favorites" collapsed={collapsed} active={activeItem === 'favorites'} onClick={() => handleItemClick('favorites')} />
            <SidebarLink icon="📍" label="Track Order" collapsed={collapsed} active={activeItem === 'track'} onClick={() => handleItemClick('track')} />
          </div>
        )}

        {isAdmin && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Administration</span>}
            <SidebarLink icon="👥" label="Users" collapsed={collapsed} active={activeItem === 'users'} onClick={() => handleItemClick('users')} />
            <SidebarLink icon="👨‍🌾" label="Farmers" collapsed={collapsed} active={activeItem === 'farmers'} onClick={() => handleItemClick('farmers')} />
            <SidebarLink icon="💵" label="Loans" collapsed={collapsed} active={activeItem === 'admin-loans'} onClick={() => handleItemClick('admin-loans')} />
            <SidebarLink icon="📊" label="Reports" collapsed={collapsed} active={activeItem === 'reports'} onClick={() => handleItemClick('reports')} />
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <SidebarLink 
          icon="⚙️" 
          label="Settings" 
          collapsed={collapsed}
          active={activeItem === 'settings'}
          onClick={() => handleItemClick('settings')}
        />
        <SidebarLink 
          icon="❓" 
          label="Help & Support" 
          collapsed={collapsed}
          active={activeItem === 'help'}
          onClick={() => handleItemClick('help')}
        />
      </div>
    </aside>
  );
}

function SidebarLink({ icon, label, collapsed, active, onClick }) {
  return (
    <button 
      className={`sidebar-link ${active ? 'active' : ''}`}
      onClick={onClick}
      title={collapsed ? label : ''}
    >
      <span className="link-icon">{icon}</span>
      {!collapsed && <span className="link-label">{label}</span>}
      {!collapsed && active && <span className="active-indicator"></span>}
    </button>
  );
}
