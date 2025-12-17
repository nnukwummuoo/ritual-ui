import Video from 'next-video';
import getStarted from '../../../videos/get-started.mp4';

export default function SocialPost() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <h1 className="text-2xl font-bold mb-8 text-gray-800">Video Feed Demo</h1>

            <div className="max-w-md w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="p-4 font-bold flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                    <span className="text-sm">User_Handle</span>
                </div>

                {/* 
            Using 'next-video' to handle adaptive bitrate streaming.
            This uses the asset defined in /videos/get-started.mp4.json
        */}
                <Video
                    src={getStarted}
                    accentColor="#3b82f6"
                    controls={false}
                    autoPlay
                    loop
                    muted
                />

                <div className="p-4">
                    <p className="text-gray-700">This is a high-performance video like Instagram! It loads instantly and adapts quality based on your connection.</p>
                </div>
            </div>
        </div>
    );
}
