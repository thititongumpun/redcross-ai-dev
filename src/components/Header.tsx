import React from 'react';

interface HeaderProps {
  currentPage: 'chat' | 'train';
  onNavigate: (page: 'chat' | 'train') => void;
  onChangeApiKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onChangeApiKey }) => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">SQL Query Assistant</h1>
        <nav>
          <button
            className={`px-4 py-2 rounded-md mr-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              currentPage === 'chat'
                ? 'bg-blue-500 text-white focus:ring-blue-300'
                : 'bg-gray-600 hover:bg-gray-500 focus:ring-sky-400'
            }`}
            onClick={() => onNavigate('chat')}
          >
            Chat
          </button>
          <button
            className={`px-4 py-2 rounded-md mr-4 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              currentPage === 'train'
                ? 'bg-blue-500 text-white focus:ring-blue-300'
                : 'bg-gray-600 hover:bg-gray-500 focus:ring-sky-400'
            }`}
            onClick={() => onNavigate('train')}
          >
            Train
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-300"
            onClick={onChangeApiKey}
          >
            Change API Key
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
