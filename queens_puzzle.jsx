import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, setLogLevel } from 'firebase/firestore';

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

// Component to render player setup modal
const PlayerSetupModal = ({ onSetupComplete }) => {
  const [players, setPlayers] = React.useState(['', '', '']);

  const handlePlayerChange = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (players.every(p => p.trim() !== '')) {
      onSetupComplete(players.map(p => p.trim()));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quem vai jogar?</h2>
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 mb-4">Digite o nome dos 3 participantes.</p>
          {players.map((player, index) => (
            <div key={index} className="mb-4">
              <label htmlFor={`player-${index}`} className="block text-gray-700 font-semibold mb-1">
                Jogador {index + 1}
              </label>
              <input
                id={`player-${index}`}
                type="text"
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={`Ex: Tio, Sobrinho 1...`}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 mt-4"
          >
            Começar a Jogar!
          </button>
        </form>
      </div>
    </div>
  );
};


export default function App() {
  // --- Initialize Firebase ---
  const [db, setDb] = React.useState(null);
  const [auth, setAuth] = React.useState(null);
  const [userId, setUserId] = React.useState(null);
  const [isAuthReady, setIsAuthReady] = React.useState(false);

  const appId = typeof __app_id !== 'undefined' ? __app_id : 'puzzle-tracker-app';

  React.useEffect(() => {
    try {
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);
        setLogLevel('debug');

        onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                    } else {
                        await signInAnonymously(firebaseAuth);
                    }
                } catch (error) {
                    console.error("Erro na autenticação:", error);
                }
            }
            setIsAuthReady(true);
        });
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
  }, [appId]);


  // --- Application States ---
  const [players, setPlayers] = React.useState(null);
  const [scores, setScores] = React.useState({});
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [view, setView] = React.useState('daily'); // 'daily', 'weekly', 'monthly'
  const [loading, setLoading] = React.useState(true);
  const [times, setTimes] = React.useState({});

  const dateString = selectedDate.toISOString().split('T')[0];
  const isSunday = selectedDate.getDay() === 0;

  // --- Synchronize with Firestore ---
  React.useEffect(() => {
    if (!isAuthReady || !db) return;

    const scoresCollectionPath = `artifacts/${appId}/public/data/scores`;
    const playersDocPath = `artifacts/${appId}/public/data/config/players`;

    // Listener for players
    const unsubPlayers = onSnapshot(doc(db, playersDocPath), (doc) => {
        if (doc.exists()) {
            setPlayers(doc.data().names);
        }
        setLoading(false); // Para de carregar mesmo se não houver jogadores
    }, (error) => console.error("Erro ao buscar jogadores:", error));

    // Listener for scores
    const q = query(collection(db, scoresCollectionPath));
    const unsubScores = onSnapshot(q, (querySnapshot) => {
        const newScores = {};
        querySnapshot.forEach((doc) => {
            newScores[doc.id] = doc.data();
        });
        setScores(newScores);
    }, (error) => console.error("Erro ao buscar pontuações:", error));

    return () => {
        unsubPlayers();
        unsubScores();
    };
  }, [isAuthReady, db, appId]);

  // --- Data Manipulation Logic ---
  const handlePlayerSetup = async (playerNames) => {
    if (!db) return;
    const playersDocPath = `artifacts/${appId}/public/data/config/players`;
    try {
      await setDoc(doc(db, playersDocPath), { names: playerNames });
      setPlayers(playerNames);
    } catch (error) {
      console.error("Erro ao salvar jogadores: ", error);
    }
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
      return {
        name,
        time,
        bonusTime,
        totalTime: time + bonusTime,
      };
    });

    // Validate if at least one time was inserted
    if (results.every(r => r.totalTime === 0)) {
        alert("Por favor, insira o tempo de pelo menos um jogador.");
        return;
    }

    const scoreData = {
      date: dateString,
      dayOfWeek: selectedDate.getDay(),
      results,
    };

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
  const dailyPodium = React.useMemo(() => {
    const dayScore = scores[dateString];
    if (!dayScore || dayScore.results.every(r => r.totalTime === 0)) return null;
    return [...dayScore.results].sort((a, b) => a.totalTime - b.totalTime);
  }, [scores, dateString]);

  const weeklyPodium = React.useMemo(() => {
    if (!players) return null;

    // --- FIX START ---
    // Create a new Date object from state to avoid mutation.
    const startOfWeek = new Date(selectedDate);
    // Adjust to the Monday of the current week.
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diffToMonday);
    // --- FIX END ---

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
            const weight = dayScore.dayOfWeek === 0 ? 3 : 1; // Sunday counts as 3, other days as 1
            weeklyWins[winner.name] += weight;
        }
      }
    }

    return Object.entries(weeklyWins)
      .map(([name, wins]) => ({ name, wins }))
      .sort((a, b) => b.wins - a.wins);
  }, [scores, selectedDate, players]);

  const monthlyPodium = React.useMemo(() => {
    if (!players) return null;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const monthlyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

    Object.values(scores).forEach(score => {
      const scoreDate = new Date(score.date + 'T12:00:00'); // Adds time to avoid timezone issues
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
  React.useEffect(() => {
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

  if (loading) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>;
  }

  if (!players) {
    return <PlayerSetupModal onSetupComplete={handlePlayerSetup} />;
  }

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

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
            🏆 Placar do Puzzle das Rainhas 👑
          </h1>
          <p className="text-gray-600 mt-2">Acompanhe os resultados e descubra quem é o mestre da semana!</p>
          <p className="text-xs text-gray-500 mt-2">ID da Sala: {appId}</p>
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
                      type="number"
                      min="0"
                      placeholder="Ex: 125"
                      value={times[name]?.time || ''}
                      onChange={(e) => handleTimeChange(name, 'time', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-md mt-1"
                    />
                  </div>
                  {isSunday && (
                    <div className="mt-2">
                      <label className="text-sm text-gray-600">Tempo Bônus (segundos)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 240"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Pódio do Dia: {selectedDate.toLocaleDateString('pt-BR')}
                </h2>
                {dailyPodium ? (
                  <ul>
                    {dailyPodium.map((player, index) => (
                      <li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 rounded-lg border">
                        <PodiumIcon rank={index + 1} />
                        <span className="font-semibold text-lg text-gray-700 flex-grow">{player.name}</span>
                        <span className="text-gray-600 font-mono">{player.totalTime} seg</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum resultado registrado para este dia.</p>
                )}
              </div>
            )}

            {/* Weekly View */}
            {view === 'weekly' && (
              <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Ranking da Semana</h2>
                <p className="text-sm text-gray-500 mb-4">{getWeekRange()}</p>
                 <p className="text-xs text-gray-500 mb-4">Domingo vale 3 pontos, outros dias valem 1.</p>
                {weeklyPodium ? (
                  <ul>
                    {weeklyPodium.map((player, index) => (
                      <li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 rounded-lg border">
                        <PodiumIcon rank={index + 1} />
                        <span className="font-semibold text-lg text-gray-700 flex-grow">{player.name}</span>
                        <span className="text-gray-600 font-mono">{player.wins} {player.wins === 1 ? 'ponto' : 'pontos'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-8">Calculando resultados...</p>
                )}
              </div>
            )}

            {/* Monthly View */}
            {view === 'monthly' && (
              <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Ranking Mensal</h2>
                <p className="text-sm text-gray-500 mb-4 capitalize">{getMonthName()}</p>
                <p className="text-xs text-gray-500 mb-4">Domingo vale 3 pontos, outros dias valem 1.</p>
                {monthlyPodium ? (
                  <ul>
                    {monthlyPodium.map((player, index) => (
                      <li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 rounded-lg border">
                        <PodiumIcon rank={index + 1} />
                        <span className="font-semibold text-lg text-gray-700 flex-grow">{player.name}</span>
                        <span className="text-gray-600 font-mono">{player.wins} {player.wins === 1 ? 'ponto' : 'pontos'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-8">Calculando resultados...</p>
                )}
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
