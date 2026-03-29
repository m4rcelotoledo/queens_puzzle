import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';

import AppBranding from './components/AppBranding';
import DarkModeToggle from './components/DarkModeToggle';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './components/LoginScreen';
import PodiumIcon from './components/PodiumIcon';
import TimeInputForm from './components/TimeInputForm';
import AppFooter from './components/AppFooter';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useGameData } from './hooks/useGameData';
import { playSuccessSound } from './utils/sfx';
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
  const { db, auth, user, authError, isAllowed, appStatus, setAppStatus, handleLogin, handleLogout, firebaseAppRef } = useAuth();

  // --- States of Logic and Data ---
  const { players, setPlayers, scores, setScores } = useGameData(db, appStatus, setAppStatus, isAllowed);
  const [isDarkMode, setIsDarkMode] = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('daily');
  const [times, setTimes] = useState({});

  const [currentView, setCurrentView] = useState('scoreboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerManager, setShowPlayerManager] = useState(false);

  const appId = 'queens-puzzle';

  const playerStats = useMemo(() => calculatePlayerStats(selectedPlayer, scores), [selectedPlayer, scores]);

  const handlePlayerClick = (playerName) => {
    setSelectedPlayer(playerName);
    setCurrentView('playerStats');
  };

  // --- Data Manipulation Logic ---
  const handlePlayerSetup = async (playerNames) => {
    if (!db) return;

    const playersDocRef = doc(db, `artifacts/${appId}/config`, 'players');

    try {
      await setDoc(playersDocRef, { names: playerNames });

      // Update local state immediately for better UX
      setPlayers(playerNames);

      toast.success('Jogadores salvos com sucesso!');
      setShowPlayerManager(false); // Close the modal after saving
    } catch (error) {
      console.error("Error setting up players:", error);
      toast.error('Falha ao salvar jogadores.');
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
      toast.warning('Insira o tempo de pelo menos um jogador.');
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
      playSuccessSound();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#6366f1', '#eab308', '#22c55e']
      });
      toast.success('Placar salvo com sucesso!');

      // 5. Clears the form fields
      setTimes({});

    } catch (error) {
      console.error("Error saving score: ", error);
      toast.error('Falha ao salvar o placar.');
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
  const renderContent = () => {
    if (appStatus !== 'READY' || !user || !players) {
      if (appStatus === 'LOADING_AUTH') return <LoadingScreen message="Verificando autenticação" />;
      if (appStatus === 'LOGIN') return <LoginScreen onLogin={handleLogin} error={authError} />;
      if (appStatus === 'LOADING_DATA') {
        return <LoadingScreen message="Carregando dados" footer={<AppFooter />} />;
      }
      if (appStatus === 'WAITING_FOR_SETUP') {
        return <LoadingScreen message="Aguardando configuração inicial pelo administrador..." footer={<AppFooter />} />;
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

    return (
      <>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <AppBranding />
          <div className="flex items-center space-x-4">
            <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex items-center space-x-2">
              <img src={user?.photoURL} alt={user?.displayName || 'Avatar'} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full bg-gray-200" />
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
      </>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans flex flex-col transition-colors duration-300">
      <Toaster position="bottom-center" richColors theme={isDarkMode ? 'dark' : 'light'} />
      <AnimatePresence>
        {showPlayerManager && isAllowed && appStatus === 'READY' && (
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
      {renderContent()}
    </div>
  );
}
