import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { toast } from 'sonner';

export function useGameData(db, appStatus, setAppStatus, isAllowed) {
  const [players, setPlayers] = useState(null);
  const [scores, setScores] = useState({});
  const appId = 'queens-puzzle';

  // Effect for Loading Data (only runs when the status changes to LOADING_DATA)
  useEffect(() => {
    if (appStatus !== 'LOADING_DATA' || !db) return;

    // Listener for players
    const playersDocRef = doc(db, `artifacts/${appId}/config`, 'players');
    const unsubPlayers = onSnapshot(playersDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const playerNames = docSnap.data().names;
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
      toast.error('Erro ao carregar dados dos jogadores.');
      setAppStatus('LOGIN');
    });

    // Listener for scores
    const scoresQuery = query(collection(db, `artifacts/${appId}/public/data/scores`));
    const unsubScores = onSnapshot(scoresQuery, (snapshot) => {
      const newScores = {};
      snapshot.forEach((docSnap) => { newScores[docSnap.id] = docSnap.data(); });
      setScores(newScores);
    });

    return () => {
      unsubPlayers();
      unsubScores();
    };
  }, [appStatus, db, isAllowed, setAppStatus, appId]);

  return { players, setPlayers, scores, setScores };
}
