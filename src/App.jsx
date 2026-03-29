import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getIdTokenResult } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { m as motion, AnimatePresence } from 'framer-motion';

import AppBranding from './components/AppBranding';
import DarkModeToggle from './components/DarkModeToggle';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './components/LoginScreen';
import Notification from './components/Notification';
import PodiumIcon from './components/PodiumIcon';
import TimeInputForm from './components/TimeInputForm';
import AppFooter from './components/AppFooter';
import {
  calculatePlayerStats,
  calculateDailyPodium,
  calculateWeeklyPodium,
  calculateMonthlyPodium,
  validateTimes,
  getWeekRange,
  getMonthName
} from './utils/calculations';
import { scheduleIdleTask } from './utils/scheduleIdleTask';

const PlayerSetupModal = lazy(() => import('./components/PlayerSetupModal'));
const PlayerManagerModal = lazy(() => import('./components/PlayerManagerModal'));
const PlayerStatsPage = lazy(() => import('./components/PlayerStatsPage'));

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
  const [showPlayerManager, setShowPlayerManager] = useState(false);

  const firebaseAppRef = useRef(null);

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
    firebaseAppRef.current = app;
    const firestoreDb = getFirestore(app);
    const firebaseAuth = getAuth(app);

    setDb(firestoreDb);
    setAuth(firebaseAuth);

    // Defer Analytics (gtag) until the browser is idle — keeps first paint lighter
    scheduleIdleTask(() => {
      import('firebase/analytics')
        .then(async ({ getAnalytics, isSupported }) => {
          if (!firebaseAppRef.current) return;
          if (await isSupported()) getAnalytics(firebaseAppRef.current);
        })
        .catch(() => {});
    });

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
        const playerNames = doc.data().names;
        setPlayers(playerNames);
        setAppStatus('READY');
      } else {
        // Only admins can configure players
        if (isAllowed) {
            setAppStatus('SETUP_PLAYERS');
        }
      }
    }, (error) => {
      console.error("Error fetching players:", error);
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
      console.error("Error logging in with Google:", error);

      // Check if it's an unauthorized domain error
      if (error.code === 'auth/unauthorized-domain' || error.message.includes('unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        setAuthError(`This domain (${currentDomain}) is not authorized. Configure in Firebase Console: Authentication → Settings → Authorized domains`);
      } else {
        setAuthError("An error occurred during login. Please try again.");
      }
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

      // Update local state immediately for better UX
      setPlayers(playerNames);

      setNotification({ message: 'Jogadores salvos com sucesso!', type: 'success' });
      setShowPlayerManager(false); // Close the modal after saving
    } catch (error) {
      console.error("Error setting up players:", error);
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
      scheduleIdleTask(() => {
        import('firebase/analytics')
          .then(async ({ getAnalytics, isSupported, logEvent }) => {
            if (firebaseAppRef.current && (await isSupported())) {
              const analytics = getAnalytics(firebaseAppRef.current);
              logEvent(analytics, 'score_saved', { date: dateString, player_count: results.length });
            }
          })
          .catch(() => {
            /* analytics is optional */
          });
      });

      // 4. Shows the success notification
      setNotification({ message: 'Placar salvo com sucesso!', type: 'success' });

      // 5. Clears the form fields
      setTimes({});

    } catch (error) {
      console.error("Error saving score: ", error);
      setNotification({ message: 'Falha ao salvar o placar.', type: 'error' });
    }
  };

  // --- Podium Calculation Logic (Memorized) ---
  const _y = selectedDate.getFullYear();
  const _m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const _d = String(selectedDate.getDate()).padStart(2, '0');
  const dateString = `${_y}-${_m}-${_d}`;
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
    if (appStatus === 'LOADING_DATA') {
      return <LoadingScreen message="Carregando dados" footer={<AppFooter />} />;
    }
    if (appStatus === 'SETUP_PLAYERS' && isAllowed) {
      return (
        <>
          <Suspense fallback={<LoadingScreen message="Carregando configuração" />}>
            <PlayerSetupModal onSetupComplete={handlePlayerSetup} />
          </Suspense>
          <div className="fixed bottom-0 left-0 right-0 z-[60]">
            <AppFooter variant="overlay" />
          </div>
        </>
      );
    }
    return <LoadingScreen message="Inicializando" footer={<AppFooter />} />;
  }

  // If appStatus is 'READY', render the main application
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans flex flex-col transition-colors duration-300">
      <AnimatePresence>
        {notification.message && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />}
        {showPlayerManager && isAllowed && (
          <Suspense fallback={null}>
            <PlayerManagerModal
              players={players}
              scores={scores}
              onSetupComplete={handlePlayerSetup}
              onClose={() => setShowPlayerManager(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <AppBranding />
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
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {isAllowed ? 'Registrar Tempos' : 'Explorar Datas'}
                    </h2>
                    {isAllowed && (
                      <button
                        onClick={() => setShowPlayerManager(true)}
                        className="px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Gerenciar jogadores"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>Gerenciar</span>
                      </button>
                    )}
                  </div>

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
                              <button onClick={() => handlePlayerClick(player.name)} className="font-semibold text-lg text-left text-gray-700 dark:text-gray-200 grow hover:underline">{player.name}</button>
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
                              <button onClick={() => handlePlayerClick(player.name)} className="font-semibold text-lg text-left text-gray-700 dark:text-gray-200 grow hover:underline">{player.name}</button>
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
                              <button onClick={() => handlePlayerClick(player.name)} className="font-semibold text-lg text-left text-gray-700 dark:text-gray-200 grow hover:underline">{player.name}</button>
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
                <Suspense fallback={<LoadingScreen message="Carregando estatísticas" />}>
                  <PlayerStatsPage stats={playerStats} onBack={() => setCurrentView('scoreboard')} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      </div>
      <AppFooter />
    </div>
  );
}
