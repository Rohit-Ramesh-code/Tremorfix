import { useNavigate, useParams } from 'react-router-dom';
import { Home, Dumbbell, Mail, User, Play, Check, HandMetal, Wind, GripHorizontal, RotateCw, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import confetti from 'canvas-confetti';

const exercises = [
    {
        id: 1,
        title: 'Gentle finger stretch',
        duration: '3 min',
        difficulty: 'Gentle',
        icon: <HandMetal className="w-12 h-12 text-teal-600" />,
        description: 'Slowly stretch each finger, one at a time. Hold for 5 seconds, then release.',
    },
    {
        id: 2,
        title: 'Breathing pause',
        duration: '2 min',
        difficulty: 'Gentle',
        icon: <Wind className="w-12 h-12 text-teal-600" />,
        description: 'Take slow, deep breaths. Breathe in for 4 seconds, hold for 4, exhale for 4.',
    },
    {
        id: 3,
        title: 'Slow grip practice',
        duration: '3 min',
        difficulty: 'Gentle',
        icon: <GripHorizontal className="w-12 h-12 text-teal-600" />,
        description: 'Gently squeeze a soft ball or rolled towel. Hold for 3 seconds, then release.',
    },
    {
        id: 4,
        title: 'Wrist rotations',
        duration: '2 min',
        difficulty: 'Gentle',
        icon: <RotateCw className="w-12 h-12 text-teal-600" />,
        description: 'Rotate your wrists slowly in circles, first clockwise, then counter-clockwise.',
    },
    {
        id: 5,
        title: 'Thumb touches',
        duration: '2 min',
        difficulty: 'Gentle',
        icon: <ThumbsUp className="w-12 h-12 text-teal-600" />,
        description: 'Touch your thumb to each fingertip slowly. Repeat several times.',
    },
];

export default function Exercises() {
    const navigate = useNavigate();
    const { profileId } = useParams();
    const [completedExercises, setCompletedExercises] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleComplete = (id) => {
        setCompletedExercises([...completedExercises, id]);
        setShowSuccess(true);
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
        });
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 pb-24 font-['Inter',system-ui,sans-serif]">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur-md shadow-sm px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Exercises</h1>
                <p className="text-sm text-gray-600">Gentle activities for steadier hands</p>
            </header>

            {/* Success Message */}
            {showSuccess && (
                <div className="mx-6 mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <Check className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-900">Nice work!</p>
                        <p className="text-sm text-green-700">Small steps help.</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="px-6 py-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">This week</p>
                            <p className="text-3xl font-bold text-teal-600">{completedExercises.length}</p>
                            <p className="text-sm text-gray-700 mt-1">exercises completed</p>
                        </div>
                        <Dumbbell className="w-16 h-16 text-teal-600" />
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <main className="px-6 space-y-4 max-w-lg mx-auto w-full">
                {exercises.map((exercise) => {
                    const isCompleted = completedExercises.includes(exercise.id);
                    return (
                        <div
                            key={exercise.id}
                            className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border transition-all ${isCompleted ? 'border-green-300 bg-green-50/80' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex items-start gap-4 mb-3">
                                <div>{exercise.icon}</div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{exercise.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        {exercise.duration} • {exercise.difficulty}
                                    </p>
                                </div>
                                {isCompleted && <Check className="w-6 h-6 text-green-600" />}
                            </div>
                            <p className="text-sm text-gray-700 mb-4">{exercise.description}</p>
                            <button
                                onClick={() => handleComplete(exercise.id)}
                                disabled={isCompleted}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${isCompleted
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                    }`}
                            >
                                {isCompleted ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Completed
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Start Exercise
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-gray-200 px-6 py-4">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <NavButton icon={<Home />} label="Home" onClick={() => navigate(`/profile/${profileId}`)} />
                    <NavButton icon={<Dumbbell />} label="Exercises" isActive />
                    <NavButton icon={<Mail />} label="Messages" onClick={() => navigate(`/profile/${profileId}/messages`)} />
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
