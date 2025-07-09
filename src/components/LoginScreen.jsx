import React from 'react';

const LoginScreen = ({ onLogin, error }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <div className="text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
        🏆 Placar do Puzzle das Rainhas 👑
      </h1>
      <p className="text-gray-600 mt-2">Faça login para continuar</p>
    </div>
    <button
      onClick={onLogin}
      className="bg-white px-6 py-3 rounded-lg shadow-lg flex items-center font-semibold text-gray-700 hover:bg-gray-200 transition-all duration-300"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-6 h-6 mr-4"/>
      Entrar com Google
    </button>
    {error && <p className="text-red-500 mt-4">{error}</p>}
  </div>
);

export default LoginScreen;
