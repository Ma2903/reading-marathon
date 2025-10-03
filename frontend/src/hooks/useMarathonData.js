import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export function useMarathonData(marathonId = 'verao_2025') {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    
    useEffect(() => {
        // Conectar WebSocket
        const newSocket = io(API_URL);
        
        newSocket.on('connect', () => {
            console.log('✅ WebSocket conectado');
            setConnected(true);
            newSocket.emit('joinMarathon', marathonId);
        });
        
        newSocket.on('initialState', (state) => {
            setTotalPages(state.totalPages);
            setLeaderboard(state.leaderboard);
        });
        
        newSocket.on('newReading', (data) => {
            console.log('📨 Nova leitura:', data);
            
            setTotalPages(data.totalPages);
            setLeaderboard(data.leaderboard);
            
            // Adicionar ao feed
            setActivityFeed(prev => [{
                id: Date.now(),
                participant: data.reading.participantId,
                book: data.reading.bookTitle,
                pages: data.reading.pagesRead,
                time: new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                isNew: true
            }, ...prev].slice(0, 20));
        });
        
        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket desconectado');
            setConnected(false);
        });
        
        setSocket(newSocket);
        
        // Buscar dados iniciais via REST
        fetchInitialData();
        
        return () => {
            newSocket.close();
        };
    }, [marathonId]);
    
    const fetchInitialData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/stats`);
            setTotalPages(response.data.totalPages);
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };
    
    const submitReading = useCallback(async (reading) => {
        try {
            const response = await axios.post(`${API_URL}/api/reading`, reading);
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar leitura:', error);
            throw error;
        }
    }, []);
    
    return {
        connected,
        totalPages,
        leaderboard,
        activityFeed,
        submitReading
    };
}