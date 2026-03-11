import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
            <h1 className="text-2xl font-bold text-indigo-600 mb-8">
                FinTrack V2
            </h1>

            <nav className="flex flex-col gap-3">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/accounts"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Accounts
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Transactions
                </NavLink>

                <NavLink
                    to="/budget"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Budget & Targets
                </NavLink>

                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Reports
                </NavLink>

                <NavLink
                    to="/scheduler"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Scheduler
                </NavLink>

            </nav>

            <div className="mt-auto pt-6">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md font-medium ${isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
                        }`
                    }
                >
                    Settings
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
