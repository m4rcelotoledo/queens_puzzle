import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  getDoc

} from 'firebase/firestore';

// Component to render podium icon
const PodiumIcon = ({ rank }) => {
  const icons = {
    1: { emoji: '🥇', color: 'text-yellow-400' },
    2: { emoji: '🥈', color: 'text-gray-400' },
    3: { emoji: '🥉', color: 'text-yellow-600' },
  };
  if (!icons[rank]) return null;
  return <span className={`mr-2 text-2xl ${icons[rank].color}`}>{icons[rank].emoji}</span>;
};

// Application State Components
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-lg">
    {message}...
  </div>
);

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

const PlayerSetupModal = ({ onSetupComplete }) => {
  const [playerNames, setPlayerNames] = useState(['', '', '']);

  const handlePlayerChange = (index, name) => {
    const newPlayers = [...playerNames];
    newPlayers[index] = name;
    setPlayerNames(newPlayers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerNames.every(p => p.trim() !== '')) {
      onSetupComplete(playerNames.map(p => p.trim()));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Configure os Jogadores</h2>
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 mb-4">Digite o nome dos 3 participantes. Isto só precisa de ser feito uma vez.</p>
          {playerNames.map((_, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={playerNames[index]}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={`Nome do Jogador ${index + 1}`}
                required
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700">
            Salvar Jogadores
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Component of the Application ---
export default function App() {
  // --- Configuration and Authentication States ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  // --- States of Logic and Data ---
  const [appStatus, setAppStatus] = useState('LOADING_AUTH'); // LOADING_AUTH, LOGIN, LOADING_DATA, SETUP_PLAYERS, READY
  const [players, setPlayers] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('daily');
  const [times, setTimes] = useState({});

  const appId = 'queens-puzzle';

  // Startup Effect (runs only once)
  useEffect(() => {
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const firestoreDb = getFirestore(app);
    const firebaseAuth = getAuth(app);

    setDb(firestoreDb);
    setAuth(firebaseAuth);

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        const permissionsDocRef = doc(firestoreDb, `artifacts/${appId}/config`, 'permissions');
        try {
            const permissionsDoc = await getDoc(permissionsDocRef);
            if (permissionsDoc.exists() && permissionsDoc.data().allowedUsers.includes(currentUser.email)) {
              setUser(currentUser);
              setAppStatus('LOADING_DATA');
            } else {
              setAuthError('Acesso negado. A sua conta não tem permissão.');
              await signOut(firebaseAuth);
              setUser(null);
              setAppStatus('LOGIN');
            }
        } catch (error) {
            console.error("Erro ao verificar permissões:", error);
            setAuthError('Ocorreu um erro ao verificar as suas permissões.');
            await signOut(firebaseAuth);
            setUser(null);
            setAppStatus('LOGIN');
        }
      } else {
        setUser(null);
        setAppStatus('LOGIN');
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect for Loading Data (only runs when the status changes to LOADING_DATA)
  useEffect(() => {
    if (appStatus !== 'LOADING_DATA' || !db) return;

    const playersDocRef = doc(db, `artifacts/${appId}/public/data/config`, 'players');

    // Listener for players
    const unsubPlayers = onSnapshot(playersDocRef, (doc) => {
      if (doc.exists()) {
        setPlayers(doc.data().names);
        setAppStatus('READY');
      } else {
        setAppStatus('SETUP_PLAYERS');
      }
    }, (error) => {
      console.error("Erro ao buscar jogadores:", error);
      setAppStatus('LOGIN');
    });

    // Listener for scores
    const scoresQuery = query(collection(db, `artifacts/${appId}/public/data/scores`));
    const unsubScores = onSnapshot(scoresQuery, (snapshot) => {
      const newScores = {};
      snapshot.forEach((doc) => { newScores[doc.id] = doc.data(); });
      setScores(newScores);
    });

    return () => {
      unsubPlayers();
      unsubScores();
    };
  }, [appStatus, db]);

  // --- Action Functions ---
  const handleLogin = async () => {
    if (!auth) return;
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setAuthError("Ocorreu um erro durante o login.");
    }
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  // --- Data Manipulation Logic ---
  const handlePlayerSetup = async (playerNames) => {
    if (!db) return;
    const playersDocRef = doc(db, `artifacts/${appId}/public/data/config`, 'players');
    await setDoc(playersDocRef, { names: playerNames });
  };

  const handleTimeChange = (playerName, type, value) => {
    const numericValue = value === '' ? '' : Math.max(0, parseInt(value, 10));
    setTimes(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        [type]: numericValue
      }
    }));
  };

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!db || !players) return;

    const results = players.map(name => {
      const time = times[name]?.time || 0;
      const bonusTime = isSunday ? (times[name]?.bonusTime || 0) : 0;
      return { name, time, bonusTime, totalTime: time + bonusTime };
    });

    // Validate if at least one time was inserted
    if (results.every(r => r.totalTime === 0)) {
        alert("Por favor, insira o tempo de pelo menos um jogador.");
        return;
    }

    const scoreData = { date: dateString, dayOfWeek: selectedDate.getDay(), results };

    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/scores`, dateString);
      await setDoc(docRef, scoreData);
      // Clean up fields after saving
      setTimes({});
    } catch (error) {
      console.error("Erro ao salvar pontuação: ", error);
    }
  };


  // --- Podium Calculation Logic (Memorized) ---
  const dateString = selectedDate.toISOString().split('T')[0];
  const isSunday = selectedDate.getDay() === 0;

  const dailyPodium = useMemo(() => {
    const dayScore = scores[dateString];
    if (!dayScore || dayScore.results.every(r => r.totalTime === 0)) return null;
    return [...dayScore.results].sort((a, b) => a.totalTime - b.totalTime);
  }, [scores, dateString]);

  const weeklyPodium = useMemo(() => {
    if (!players) return null;
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diffToMonday);

    const weeklyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const currentDateString = currentDate.toISOString().split('T')[0];
      const dayScore = scores[currentDateString];

      if (dayScore && !dayScore.results.every(r => r.totalTime === 0)) {
        const sortedDay = [...dayScore.results].sort((a, b) => a.totalTime - b.totalTime);
        const winner = sortedDay[0];
        if (winner && winner.totalTime > 0) {
            const weight = dayScore.dayOfWeek === 0 ? 3 : 1;
            weeklyWins[winner.name] += weight;
        }
      }
    }
    return Object.entries(weeklyWins)
      .map(([name, wins]) => ({ name, wins }))
      .sort((a, b) => b.wins - a.wins);
  }, [scores, selectedDate, players]);

  const monthlyPodium = useMemo(() => {
    if (!players) return null;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const monthlyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

    Object.values(scores).forEach(score => {
      const scoreDate = new Date(score.date + 'T12:00:00');
      if (scoreDate.getFullYear() === year && scoreDate.getMonth() === month) {
        if (score.results && !score.results.every(r => r.totalTime === 0)) {
            const sortedDay = [...score.results].sort((a, b) => a.totalTime - b.totalTime);
            const winner = sortedDay[0];
            if (winner && winner.totalTime > 0) {
                const weight = score.dayOfWeek === 0 ? 3 : 1;
                monthlyWins[winner.name] += weight;
            }
        }
      }
    });
    return Object.entries(monthlyWins)
      .map(([name, wins]) => ({ name, wins }))
      .sort((a, b) => b.wins - a.wins);
  }, [scores, selectedDate, players]);

  // --- This effect fills the times when the date changes ---
  useEffect(() => {
    const dayScore = scores[dateString];
    if (dayScore) {
      const initialTimes = {};
      dayScore.results.forEach(r => {
        initialTimes[r.name] = { time: r.time, bonusTime: r.bonusTime };
      });
      setTimes(initialTimes);
    } else {
      setTimes({});
    }
  }, [dateString, scores]);

  const getWeekRange = () => {
    const monday = new Date(selectedDate);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const format = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${format(monday)} - ${format(sunday)}`;
  };

  const getMonthName = () => {
      return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric'});
  }

  // --- State-Based Rendering ---
  if (appStatus === 'LOADING_AUTH') return <LoadingScreen message="Verificando autenticação" />;
  if (appStatus === 'LOGIN') return <LoginScreen onLogin={handleLogin} error={authError} />;
  if (appStatus === 'LOADING_DATA') return <LoadingScreen message="Carregando dados" />;
  if (appStatus === 'SETUP_PLAYERS') return <PlayerSetupModal onSetupComplete={handlePlayerSetup} />;

  // If appStatus is 'READY', render the main application
  if (appStatus === 'READY' && user && players) {
    return (
      <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8 relative">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
              🏆 Placar do Puzzle das Rainhas 👑
            </h1>
            <p className="text-gray-600 mt-2">Acompanhe os resultados e descubra quem é o mestre da semana!</p>
            <div className="absolute top-0 right-0 flex flex-col items-end">
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
              <span className="text-xs text-gray-500">{user.displayName}</span>
              <button onClick={handleLogout} className="text-sm text-indigo-600 hover:underline">Sair</button>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Data Entry Column */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Registrar Tempos</h2>
              <div className="mb-4">
                <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione a Data
                </label>
                <input
                  id="date-picker"
                  type="date"
                  value={dateString}
                  onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <form onSubmit={handleSaveScore}>
                {players.map(name => (
                  <div key={name} className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <h3 className="font-bold text-indigo-700">{name}</h3>
                    <div className="mt-2">
                      <label className="text-sm text-gray-600">Tempo (segundos)</label>
                      <input
                        type="number" min="0" placeholder="Ex: 125"
                        value={times[name]?.time || ''}
                        onChange={(e) => handleTimeChange(name, 'time', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md mt-1"
                      />
                    </div>
                    {isSunday && (
                      <div className="mt-2">
                        <label className="text-sm text-gray-600">Tempo Bônus (segundos)</label>
                        <input
                          type="number" min="0" placeholder="Ex: 240"
                          value={times[name]?.bonusTime || ''}
                          onChange={(e) => handleTimeChange(name, 'bonusTime', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded-md mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                  Salvar Pontuação do Dia
                </button>
              </form>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-center space-x-2 mb-6 bg-white p-2 rounded-full shadow-md">
                <button onClick={() => setView('daily')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}>Diário</button>
                <button onClick={() => setView('weekly')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'weekly' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}>Semanal</button>
                <button onClick={() => setView('monthly')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}>Mensal</button>
              </div>

              {/* Daily View */}
              {view === 'daily' && (
                <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Pódio do Dia: {selectedDate.toLocaleDateString('pt-BR')}</h2>
                  {dailyPodium ? (
                    <ul>{dailyPodium.map((player, index) => (<li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 rounded-lg border"><PodiumIcon rank={index + 1} /><span className="font-semibold text-lg text-gray-700 flex-grow">{player.name}</span><span className="text-gray-600 font-mono">{player.totalTime} seg</span></li>))}</ul>
                  ) : (<p className="text-gray-500 text-center py-8">Nenhum resultado registrado para este dia.</p>)}
                </div>
              )}

              {/* Weekly View */}
              {view === 'weekly' && (
                <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Ranking da Semana</h2>
                  <p className="text-sm text-gray-500 mb-4">{getWeekRange()}</p>
                  <p className="text-xs text-gray-500 mb-4">Domingo vale 3 pontos, outros dias valem 1.</p>
                  {weeklyPodium ? (
                    <ul>{weeklyPodium.map((player, index) => (<li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 rounded-lg border"><PodiumIcon rank={index + 1} /><span className="font-semibold text-lg text-gray-700 flex-grow">{player.name}</span><span className="text-gray-600 font-mono">{player.wins} {player.wins === 1 ? 'ponto' : 'pontos'}</span></li>))}</ul>
                  ) : (<p className="text-gray-500 text-center py-8">Calculando resultados...</p>)}
                </div>
              )}

              {/* Monthly View */}
              {view === 'monthly' && (
                <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Ranking Mensal</h2>
                  <p className="text-sm text-gray-500 mb-4 capitalize">{getMonthName()}</p>
                  <p className="text-xs text-gray-500 mb-4">Domingo vale 3 pontos, outros dias valem 1.</p>
                  {monthlyPodium ? (
                    <ul>{monthlyPodium.map((player, index) => (<li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 rounded-lg border"><PodiumIcon rank={index + 1} /><span className="font-semibold text-lg text-gray-700 flex-grow">{player.name}</span><span className="text-gray-600 font-mono">{player.wins} {player.wins === 1 ? 'ponto' : 'pontos'}</span></li>))}</ul>
                  ) : (<p className="text-gray-500 text-center py-8">Calculando resultados...</p>)}
                </div>
              )}

            </div>
          </main>
        </div>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  // Fallback for any other case
  return <LoadingScreen message="Inicializando" />;
}
