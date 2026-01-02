export default function SocialPost() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <h1 className="text-2xl font-bold mb-8 text-gray-800">Video Feed Demo</h1>

            <div className="max-w-md w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="p-4 font-bold flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                    <span className="text-sm">User_Handle</span>
                </div>

                {/* Video placeholder */}
                <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-center px-4">
                        Video player removed (Mux integration removed)
                    </p>
                </div>

                <div className="p-4">
                    <p className="text-gray-700">This is a demo feed page. Video playback has been updated to use direct sources.</p>
                </div>
            </div>
        </div>
    );
}
