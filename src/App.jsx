import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getIdTokenResult } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

import DarkModeToggle from './components/DarkModeToggle';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './components/LoginScreen';
import Notification from './components/Notification';
import PlayerSetupModal from './components/PlayerSetupModal';
import PlayerStatsPage from './components/PlayerStatsPage';
import PodiumIcon from './components/PodiumIcon';
import TimeInputForm from './components/TimeInputForm';
import {
  calculatePlayerStats,
  calculateDailyPodium,
  calculateWeeklyPodium,
  calculateMonthlyPodium,
  validateTimes,
  getWeekRange,
  getMonthName
} from './utils/calculations';

// --- Main Component of the Application ---
export default function App() {
  // --- Configuration and Authentication States ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);

  // --- States of Logic and Data ---
  const [appStatus, setAppStatus] = useState('LOADING_AUTH'); // LOADING_AUTH, LOGIN, LOADING_DATA, SETUP_PLAYERS, READY
  const [players, setPlayers] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('daily');
  const [times, setTimes] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [currentView, setCurrentView] = useState('scoreboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const appId = 'queens-puzzle';

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

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
        // Force token refresh to get the latest Custom Claim
        const tokenResult = await getIdTokenResult(currentUser, true);
        setUser(currentUser);
        setIsAllowed(tokenResult.claims.isAllowed === true);
        setAppStatus('LOADING_DATA');
      } else {
        setUser(null);
        setIsAllowed(false);
        setAppStatus('LOGIN');
      }
    });

    return () => unsubscribe();
  }, []);

  // Effect for Loading Data (only runs when the status changes to LOADING_DATA)
  useEffect(() => {
    if (appStatus !== 'LOADING_DATA' || !db) return;

    // Listener for players
    const playersDocRef = doc(db, `artifacts/${appId}/config`, 'players');
    const unsubPlayers = onSnapshot(playersDocRef, (doc) => {
      if (doc.exists()) {
        setPlayers(doc.data().names);
        setAppStatus('READY');
      } else {
        // Only admins can configure players
        if (isAllowed) {
            setAppStatus('SETUP_PLAYERS');
        }
      }
    }, (error) => {
      console.error("Erro ao buscar jogadores:", error);
      setNotification({ message: 'Erro ao carregar dados dos jogadores.', type: 'error' });
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
  }, [appStatus, db, isAllowed]);

  const playerStats = useMemo(() => calculatePlayerStats(selectedPlayer, scores), [selectedPlayer, scores]);

  const handlePlayerClick = (playerName) => {
    setSelectedPlayer(playerName);
    setCurrentView('playerStats');
  };

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
    const playersDocRef = doc(db, `artifacts/${appId}/config`, 'players');
    try {
      await setDoc(playersDocRef, { names: playerNames });
      setNotification({ message: 'Jogadores salvos com sucesso!', type: 'success' });
    } catch (error) {
      console.error("Erro ao configurar jogadores:", error);
      setNotification({ message: 'Falha ao salvar jogadores.', type: 'error' });
    }
  };

  const handleTimeChange = (playerName, type, value) => {
    const numericValue = value === '' ? '' : Math.max(0, parseInt(value, 10));
    setTimes(prev => ({ ...prev, [playerName]: { ...prev[playerName], [type]: numericValue } }));
  };

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!db || !players || !isAllowed) return;

    const results = players.map(name => {
      const time = Number(times[name]?.time || 0);
      const bonusTime = isSunday ? Number(times[name]?.bonusTime || 0) : 0;
      return { name, time, bonusTime, totalTime: time + bonusTime };
    });

    // Validate if at least one time was inserted
    if (!validateTimes(times, isSunday)) {
      setNotification({ message: 'Insira o tempo de pelo menos um jogador.', type: 'warning' });
      return;
    }

    const scoreData = { date: dateString, dayOfWeek: selectedDate.getDay(), results };

    try {
      // 1. Save the data to Firestore
      const docRef = doc(db, `artifacts/${appId}/public/data/scores`, dateString);
      await setDoc(docRef, scoreData);

      // 2. Updates the local state so that the UI reacts instantly
      setScores(prevScores => ({ ...prevScores, [dateString]: scoreData }));

      // 3. Sends an event to Analytics (does not block the UI)
      const analytics = getAnalytics();
      logEvent(analytics, 'score_saved', { date: dateString, player_count: results.length });

      // 4. Shows the success notification
      setNotification({ message: 'Placar salvo com sucesso!', type: 'success' });

      // 5. Clears the form fields
      setTimes({});

    } catch (error) {
      console.error("Erro ao salvar pontuação: ", error);
      setNotification({ message: 'Falha ao salvar o placar.', type: 'error' });
    }
  };

  // --- Podium Calculation Logic (Memorized) ---
  const dateString = selectedDate.toISOString().split('T')[0];
  const isSunday = selectedDate.getDay() === 0;

  const dailyPodium = useMemo(() => {
    const dayScore = scores[dateString];
    return calculateDailyPodium(dayScore);
  }, [scores, dateString]);

  const weeklyPodium = useMemo(() => {
    return calculateWeeklyPodium(players, scores, selectedDate);
  }, [scores, selectedDate, players]);

  const monthlyPodium = useMemo(() => {
    return calculateMonthlyPodium(players, scores, selectedDate);
  }, [scores, selectedDate, players]);

  // --- This effect fills the times when the date changes ---
  useEffect(() => {
    setTimes({});

    const dayScore = scores[dateString];
    if (dayScore) {
      const initialTimes = {};
      dayScore.results.forEach(r => {
        initialTimes[r.name] = { time: r.time, bonusTime: r.bonusTime };
      });
      setTimes(initialTimes);
    }
  }, [dateString, scores]);



  // --- State-Based Rendering ---
  if (appStatus !== 'READY' || !user || !players) {
    // Render loading/login/setup screens
    if (appStatus === 'LOADING_AUTH') return <LoadingScreen message="Verificando autenticação" />;
    if (appStatus === 'LOGIN') return <LoginScreen onLogin={handleLogin} error={authError} />;
    if (appStatus === 'LOADING_DATA') return <LoadingScreen message="Carregando dados" />;
    if (appStatus === 'SETUP_PLAYERS' && isAllowed) return <PlayerSetupModal onSetupComplete={handlePlayerSetup} />;
    return <LoadingScreen message="Inicializando" />;
  }

  // If appStatus is 'READY', render the main application
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <AnimatePresence>
        {notification.message && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />}
      </AnimatePresence>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-gray-100">
              🏆 Placar do Puzzle 👑
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Acompanhe os mestres do tabuleiro!</p>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex items-center space-x-2">
              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
              <button onClick={handleLogout} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Sair</button>
            </div>
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {/* CONDITIONAL RENDERING: EITHER THE SCORE OR THE STATISTICS */}
            {currentView === 'scoreboard' ? (
              <motion.div
                key="scoreboard"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column - VISIBLE TO EVERYONE */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {isAllowed ? 'Registrar Tempos' : 'Explorar Datas'}
                  </h2>

                  <div className="mb-4">
                    <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Selecione a Data
                    </label>
                    <input id="date-picker" type="date" value={dateString} onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                  </div>

                  {isAllowed ? (
                    <TimeInputForm
                        players={players}
                        isSunday={isSunday}
                        times={times}
                        handleTimeChange={handleTimeChange}
                        handleSaveScore={handleSaveScore}
                        setTimes={setTimes}
                    />
                  ) : (
                    <div className="mt-6 text-center text-gray-500 dark:text-gray-400 p-4 border-t border-gray-200 dark:border-gray-700">
                      <p>Você está no modo de visualização. Selecione uma data acima para ver o pódio do dia.</p>
                    </div>
                  )}
                </div>

                {/* Right Column - RESULTS */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-center space-x-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
                    <button onClick={() => setView('daily')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700'}`}>Diário</button>
                    <button onClick={() => setView('weekly')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'weekly' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700'}`}>Semanal</button>
                    <button onClick={() => setView('monthly')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700'}`}>Mensal</button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                      {view === 'daily' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Pódio do Dia: {selectedDate.toLocaleDateString('pt-BR')}</h2>
                          {dailyPodium ? (
                            <ul>{dailyPodium.map((player, index) => (<li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600"><PodiumIcon rank={index + 1} />
                              <button onClick={() => handlePlayerClick(player.name)} className="font-semibold text-lg text-left text-gray-700 dark:text-gray-200 flex-grow hover:underline">{player.name}</button>
                              <span className="text-gray-600 dark:text-gray-400 font-mono">{player.totalTime} seg</span></li>))}</ul>
                          ) : (<p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum resultado registrado para este dia.</p>)}
                        </div>
                      )}

                      {view === 'weekly' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Ranking da Semana</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{getWeekRange(selectedDate)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Domingo vale 3 pontos, outros dias valem 1.</p>
                          {weeklyPodium && weeklyPodium.some(p => p.wins > 0) ? (
                            <ul>{weeklyPodium.map((player, index) => (<li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600"><PodiumIcon rank={index + 1} />
                              <button onClick={() => handlePlayerClick(player.name)} className="font-semibold text-lg text-left text-gray-700 dark:text-gray-200 flex-grow hover:underline">{player.name}</button>
                              <span className="text-gray-600 dark:text-gray-400 font-mono">{player.wins} {player.wins === 1 ? 'ponto' : 'pontos'}</span></li>))}</ul>
                          ) : (<p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum resultado na semana ainda.</p>)}
                        </div>
                      )}

                      {view === 'monthly' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Ranking Mensal</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 capitalize">{getMonthName(selectedDate)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Domingo vale 3 pontos, outros dias valem 1.</p>
                          {monthlyPodium && monthlyPodium.some(p => p.wins > 0) ? (
                            <ul>{monthlyPodium.map((player, index) => (<li key={player.name} className="flex items-center p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600"><PodiumIcon rank={index + 1} />
                              <button onClick={() => handlePlayerClick(player.name)} className="font-semibold text-lg text-left text-gray-700 dark:text-gray-200 flex-grow hover:underline">{player.name}</button>
                              <span className="text-gray-600 dark:text-gray-400 font-mono">{player.wins} {player.wins === 1 ? 'ponto' : 'pontos'}</span></li>))}</ul>
                          ) : (<p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum resultado no mês ainda.</p>)}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div key="player-stats" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <PlayerStatsPage stats={playerStats} onBack={() => setCurrentView('scoreboard')} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
