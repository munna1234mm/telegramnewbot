export default function SettingsPage() {
    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
                    <p className="text-sm text-slate-500">Manage your account preferences</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900">Email Notifications</p>
                            <p className="text-sm text-slate-500">Receive weekly digests and alerts</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900">Dark Mode</p>
                            <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-pointer">
                            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button className="text-red-600 text-sm font-medium hover:underline">Delete Account</button>
                </div>
            </div>
        </div>
    );
}
