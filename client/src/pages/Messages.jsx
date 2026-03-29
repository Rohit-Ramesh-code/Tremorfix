import { useNavigate, useParams } from 'react-router-dom';
import { Home, Dumbbell, Mail, User, Send } from 'lucide-react';
import { useState } from 'react';

const messages = [
    {
        id: 1,
        sender: 'Dr. Laura',
        message: "I see your tremor was higher before your afternoon dose. Let's talk at your next visit.",
        date: '2 days ago',
        avatar: 'DL',
    },
    {
        id: 2,
        sender: 'Dr. Laura',
        message: 'Great progress this week! Your consistency with tracking is really helpful.',
        date: '1 week ago',
        avatar: 'DL',
    },
    {
        id: 3,
        sender: 'Tremorix Support',
        message: "Welcome to Tremorix! We're here if you need any help getting started.",
        date: '2 weeks ago',
        avatar: 'TS',
    },
];

export default function Messages() {
    const navigate = useNavigate();
    const { profileId } = useParams();
    const [newMessage, setNewMessage] = useState('');

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 pb-24 font-['Inter',system-ui,sans-serif]">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur-md shadow-sm px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
                <p className="text-sm text-gray-600">Doctor notes on your shared reports</p>
            </header>

            {/* Info Banner */}
            <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                    📝 This is not live chat. Your doctor reviews shared reports and leaves notes here.
                </p>
            </div>

            {/* Messages List */}
            <main className="px-6 py-6 space-y-4 max-w-lg mx-auto w-full mb-16">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {msg.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900">{msg.sender}</h3>
                                    <span className="text-xs text-gray-500">{msg.date}</span>
                                </div>
                                <p className="text-sm text-gray-700">{msg.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* Reply Section */}
            <div className="fixed bottom-[72px] left-0 right-0 bg-white/70 backdrop-blur-md border-t border-gray-200 px-6 py-4 z-40">
                <div className="max-w-md mx-auto">
                    <p className="text-xs text-gray-600 mb-2">
                        💬 You can add context when sharing your weekly report
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a note to your next share..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm"
                        />
                        <button
                            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-gray-200 px-6 py-4 z-50">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <NavButton icon={<Home />} label="Home" onClick={() => navigate(`/profile/${profileId}`)} />
                    <NavButton icon={<Dumbbell />} label="Exercises" onClick={() => navigate(`/profile/${profileId}/exercises`)} />
                    <NavButton icon={<Mail />} label="Messages" isActive />
                    <NavButton icon={<User />} label="Profile" onClick={() => navigate(`/profile/${profileId}/settings`)} />
                </div>
            </nav>
        </div>
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
