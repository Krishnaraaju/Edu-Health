/**
 * Navbar.jsx - Navigation bar component
 * Responsive navigation with auth state awareness
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🏥</span>
                        <span className="font-bold text-white hidden sm:block">
                            {t('app.name')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`text-sm transition-colors ${isActive('/dashboard') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {t('nav.dashboard')}
                                </Link>
                                <Link
                                    to="/chat"
                                    className={`text-sm transition-colors ${isActive('/chat') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {t('nav.chat')}
                                </Link>
                                <Link
                                    to="/settings"
                                    className={`text-sm transition-colors ${isActive('/settings') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {t('nav.settings')}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    {t('auth.login')}
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    {t('auth.register')}
                                </Link>
                            </>
                        )}

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {i18n.language === 'en' ? '🇬🇧' : '🇮🇳'}
                            <span>{i18n.language.toUpperCase()}</span>
                        </button>

                        {/* User Menu */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400">
                                    {user?.name?.split(' ')[0]}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    {t('auth.logout')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
                        <div className="flex flex-col gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {t('nav.dashboard')}
                                    </Link>
                                    <Link
                                        to="/chat"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {t('nav.chat')}
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {t('nav.settings')}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-left text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        {t('auth.logout')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {t('auth.login')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {t('auth.register')}
                                    </Link>
                                </>
                            )}

                            {/* Language Toggle */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {i18n.language === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
