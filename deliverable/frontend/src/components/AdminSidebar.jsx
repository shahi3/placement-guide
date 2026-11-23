import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/auth';
import '../styles/Sidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearSession('admin');
        navigate('/admin-login'); // ✅ Redirect to login page
    };

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Admin Panel</h2>
            <nav>
                <ul className="sidebar-links">
                    <li><Link to="/admin/manage-students">Manage Students</Link></li>
                    <li><Link to="/admin/manage-companies">Manage Companies</Link></li>
                    <li><Link to="/admin/manage-tests">Manage Tests</Link></li>
                    <li><Link to="/admin/manage-results">Manage Results</Link></li>
                    <li><Link to="/admin/learning-materials">Learning Materials</Link></li>
                    <li><Link to="/admin/manage-alumni-stories">Manage Alumni Stories</Link></li>
                    <li><Link to="/admin/analytics">Dashboard Analytics</Link></li>
                    <li><Link to="/admin/grouped-students">Grouped Students</Link></li>
                </ul>
            </nav>
            
            <button className="logout-button" onClick={handleLogout}>🚪 Logout</button> {/* ✅ Logout Button */}
        </div>
    );
};

export default AdminSidebar;
