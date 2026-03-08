import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">Nexus API</Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <span style={{ fontWeight: 500 }}>Welcome, {user.username} {user.role === 'admin' && '(Admin)'}</span>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
