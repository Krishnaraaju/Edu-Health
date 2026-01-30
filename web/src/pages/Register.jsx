/**
 * Register.jsx - Registration page component
 * Handles new user registration with validation
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validation.nameRequired');
        } else if (formData.name.length < 2) {
            newErrors.name = t('validation.nameTooShort');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('validation.emailRequired');
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = t('validation.emailInvalid');
        }

        if (!formData.password) {
            newErrors.password = t('validation.passwordRequired');
        } else if (formData.password.length < 8) {
            newErrors.password = t('validation.passwordTooShort');
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = t('validation.passwordWeak');
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('validation.passwordMismatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        const result = await register(formData.name, formData.email, formData.password);

        if (result.success) {
            navigate('/onboarding', { replace: true });
        } else {
            setErrors({ submit: result.error || t('auth.registerError') });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="glass-card p-8 animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-4">🏥</div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {t('auth.createAccount')}
                        </h1>
                        <p className="text-gray-400">
                            {t('auth.registerSubtitle')}
                        </p>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
                            {errors.submit}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.name')}
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                                placeholder={t('auth.namePlaceholder')}
                                autoComplete="name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.password')}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {t('auth.passwordHint')}
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('auth.confirmPassword')}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {t('common.loading')}
                                </span>
                            ) : (
                                t('auth.register')
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-gray-400 mt-6">
                        {t('auth.hasAccount')}{' '}
                        <Link
                            to="/login"
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            {t('auth.login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
