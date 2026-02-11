import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const navLinkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors block";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Brand / Logo Area - kept minimal as per user's previous preference, 
                        but effectively acts as 'Home' reference or just left alignment 
                    */}
                    <div className="flex items-center gap-2">
                        <NavLink to="/" className="text-lg font-bold text-slate-900" onClick={closeMenu}>
                            Megabike
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        <NavLinks mobile={false} />
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                    >
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isOpen && (
                    <nav className="md:hidden mt-4 flex flex-col gap-2 pb-4 border-t border-slate-100 pt-4">
                        <NavLinks mobile={true} onClick={closeMenu} />
                    </nav>
                )}
            </div>
        </header>
    );
}

function NavLinks({ mobile, onClick }) {
    const baseClass = mobile
        ? "block w-full px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-slate-50"
        : "px-3 py-2 rounded-md text-sm font-medium transition-colors";

    return (
        <>
            <NavigationLink to="/" onClick={onClick} baseClass={baseClass}>Accueil</NavigationLink>
            <NavigationLink to="/my-team" onClick={onClick} baseClass={baseClass}>Mon Équipe</NavigationLink>
            <NavigationLink to="/calendar" onClick={onClick} baseClass={baseClass}>Calendrier</NavigationLink>
            <NavigationLink to="/rules" onClick={onClick} baseClass={baseClass}>Règles</NavigationLink>
            <NavigationLink to="/leaderboard" onClick={onClick} baseClass={baseClass}>Classement</NavigationLink>
            <NavigationLink to="/profile" onClick={onClick} baseClass={baseClass}>Profil</NavigationLink>
        </>
    );
}

function NavigationLink({ to, children, onClick, baseClass }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            end={to === "/"}
            className={({ isActive }) =>
                `${baseClass} ${isActive
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`
            }
        >
            {children}
        </NavLink>
    );
}
