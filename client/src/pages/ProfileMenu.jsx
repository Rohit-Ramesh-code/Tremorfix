import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Home,
    Dumbbell,
    Mail,
    User,
    ChevronRight,
    Bluetooth,
    Shield,
    Bell,
    Palette,
    HelpCircle,
    LogOut,
} from 'lucide-react';

export default function ProfileMenu() {
    const navigate = useNavigate();
    const { profileId } = useParams();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch('/api/profiles')
            .then(res => res.json())
            .then(profiles => {
                const found = profiles.find(p => String(p.id) === String(profileId));
                if (found) setProfile(found);
            })
            .catch(console.error);
    }, [profileId]);

    const userName = profile ? profile.name : 'Seyon Patel';
    const initial = userName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 pb-24 font-['Inter',system-ui,sans-serif]">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur-md shadow-sm px-6 py-6">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold mb-3 shadow-md">
                        {initial}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
                    <p className="text-sm text-gray-600">{userName.split(' ')[0].toLowerCase()}@email.com</p>
                    <p className="text-xs text-gray-500 mt-1">Patient ID: {profileId || '12345'}</p>
                </div>
            </header>

            <main className="px-6 py-6 space-y-6 max-w-lg mx-auto w-full">
                {/* Devices Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Devices</h2>
                    </div>
                    <SettingsItem
                        icon={<Bluetooth />}
                        label="Manage Devices"
                        sublabel="Tremorix Spoon 1 connected"
                        onClick={() => { }}
                    />
                </div>

                {/* Privacy & Security */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Privacy & Security</h2>
                    </div>
                    <SettingsItem
                        icon={<Shield />}
                        label="Data Sharing"
                        sublabel="Control who sees your health data"
                        onClick={() => { }}
                    />
                    <SettingsItem
                        icon={<Shield />}
                        label="Privacy Policy"
                        sublabel="How we protect your information"
                        onClick={() => { }}
                        noBorder
                    />
                </div>

                {/* Preferences */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Preferences</h2>
                    </div>
                    <SettingsItem
                        icon={<Bell />}
                        label="Notifications"
                        sublabel="Reminders and updates"
                        onClick={() => { }}
                    />
                    <SettingsItem
                        icon={<Palette />}
                        label="Appearance"
                        sublabel="Display and contrast settings"
                        onClick={() => { }}
                        noBorder
                    />
                </div>

                {/* Support */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Support</h2>
                    </div>
                    <SettingsItem
                        icon={<HelpCircle />}
                        label="Help Center"
                        sublabel="FAQs and tutorials"
                        onClick={() => { }}
                    />
                    <SettingsItem
                        icon={<Mail />}
                        label="Contact Support"
                        sublabel="Get help from our team"
                        onClick={() => { }}
                        noBorder
                    />
                </div>

                {/* Account Actions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-between px-5 py-4 text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Log Out</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* App Info */}
                <div className="text-center text-xs text-gray-500 pt-4">
                    <p>Tremorix v1.0.0</p>
                    <p className="mt-1">© 2026 Tremorix Health</p>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-gray-200 px-6 py-4 z-50">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <NavButton icon={<Home />} label="Home" onClick={() => navigate(`/profile/${profileId}`)} />
                    <NavButton icon={<Dumbbell />} label="Exercises" onClick={() => navigate(`/profile/${profileId}/exercises`)} />
                    <NavButton icon={<Mail />} label="Messages" onClick={() => navigate(`/profile/${profileId}/messages`)} />
                    <NavButton icon={<User />} label="Profile" isActive />
                </div>
            </nav>
        </div>
    );
}

function SettingsItem({ icon, label, sublabel, onClick, noBorder = false }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${noBorder ? '' : 'border-b border-gray-100'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                    {icon}
                </div>
                <div className="text-left">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-600">{sublabel}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
    );
}

function NavButton({ icon, label, isActive = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            <div className="w-6 h-6">{icon}</div>
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}
