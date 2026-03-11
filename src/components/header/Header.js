const Header = () => {
    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
                Welcome Back
            </h2>

            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">
                Logout
            </button>
        </header>
    );
};

export default Header;
