// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Book, Trophy, Users, Clock, Target, Activity, Send, LogOut, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- COMPONENTES INTERNOS ---

const AnimatedCounter = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);
  useEffect(() => {
    const duration = 700;
    const startValue = currentValue;
    const endValue = value;
    let startTime = null;
    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const nextValue = Math.floor(progress * (endValue - startValue) + startValue);
      setCurrentValue(nextValue);
      if (progress < 1) requestAnimationFrame(animation);
      else setCurrentValue(endValue);
    };
    requestAnimationFrame(animation);
  }, [value]);
  return <span>{currentValue.toLocaleString('pt-BR')}</span>;
};

// --- CONFIGURAÇÃO PRINCIPAL ---

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

function App() {
  const [marathonData, setMarathonData] = useState({ totalPaginasLidas: 0, atividades: [], participantes: {} });
  const [participant, setParticipant] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [goal] = useState(50000);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "initialData" || message.type === "update") {
        setMarathonData(message.data);
      }
    };
    ws.onopen = () => console.log("✅ WebSocket conectado!");
    ws.onerror = (error) => console.error("❌ Erro no WebSocket:", error);
    return () => ws.close();
  }, []);

  const handleRegister = () => {
    if (participant.trim()) setIsRegistered(true);
  };

  const handleLogout = () => {
    setIsRegistered(false);
    setParticipant('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookTitle = e.target.bookTitle.value;
    const pagesRead = e.target.pagesRead.value;
    if (!bookTitle || !pagesRead || !participant) return;
    try {
      await fetch(`${API_URL}/leitura`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: participant,
          bookTitle,
          pagesRead: parseInt(pagesRead),
        }),
      });
      e.target.reset();
    } catch (error) {
      console.error("Erro ao registrar leitura:", error);
    }
  };

  const leaderboard = Object.entries(marathonData.participantes)
    .map(([name, data]) => ({ name, pages: data.paginasLidas }))
    .sort((a, b) => b.pages - a.pages)
    .slice(0, 5);
    
  const progressPercentage = marathonData.totalPaginasLidas > 0 ? (marathonData.totalPaginasLidas / goal) * 100 : 0;
  
  const hourlyActivity = Array.from({ length: 15 }, (_, i) => ({
      hour: `${8 + i}:00`,
      pages: Math.floor(Math.random() * 50) + 10,
  }));

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Book className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Maratona de Leitura</h1>
          </div>
          <p className="text-gray-600 mb-6 text-center">Entre na maratona e comece a registrar seu progresso!</p>
          <input type="text" placeholder="Seu nome de participante" value={participant} onChange={(e) => setParticipant(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleRegister()} />
          <button onClick={handleRegister} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Começar a Ler! 🚀
          </button>
        </div>
      </div>
    );
  }

  const TabButton = ({ tabName, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === tabName ? 'bg-white text-purple-700 shadow-md' : 'text-purple-200 hover:bg-white/20'}`}>
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Maratona de Leitura</h1>
            <p className="text-purple-200">Bem-vindo(a), <span className="font-bold">{participant}</span>!</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white/10 text-purple-200 hover:bg-white/20 transition-all">
            <LogOut size={16} /> Sair
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <nav className="flex space-x-2 bg-white/10 p-2 rounded-full">
              <TabButton tabName="overview" icon={Target} label="Visão Geral" />
              <TabButton tabName="leaderboard" icon={Trophy} label="Ranking" />
              <TabButton tabName="charts" icon={BarChartIcon} label="Gráficos" />
            </nav>

            {/* Conteúdo das Abas */}
            {activeTab === 'overview' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Progresso Coletivo</h2>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white"><AnimatedCounter value={marathonData.totalPaginasLidas} /></div>
                    <div className="text-purple-200">de {goal.toLocaleString('pt-BR')} páginas</div>
                  </div>
                </div>
                <div className="relative h-8 bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-white font-bold text-sm drop-shadow-lg">{progressPercentage.toFixed(1)}%</span></div>
                </div>
              </div>
            )}
            
            {activeTab === 'leaderboard' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
                 <div className="space-y-3">
                  {leaderboard.map((reader, index) => (
                    <div key={reader.name} className={`flex items-center justify-between p-3 rounded-xl transition-all ${index === 0 ? 'bg-yellow-400/20' : 'bg-white/5'}`}>
                      <div className="flex items-center"><div className="text-xl mr-3 w-6 text-center text-white">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</div><div className="text-white font-semibold">{reader.name}</div></div>
                      <div className="text-lg font-bold text-white">{reader.pages.toLocaleString('pt-BR')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Clock className="w-6 h-6 mr-2 text-green-400" />Atividade por Hora</h3>
                  <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={hourlyActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="hour" tick={{ fill: '#a78bfa', fontSize: 10 }} interval={1} />
                          <YAxis tick={{ fill: '#a78bfa', fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 27, 75, 0.8)', border: 'none', borderRadius: '10px' }} />
                          <Bar dataKey="pages" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} /><defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/><stop offset="100%" stopColor="#ec4899" stopOpacity={0.5}/></linearGradient></defs>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
            )}
            
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Book className="w-6 h-6 mr-2" />Registre sua Leitura</h3>
              <div className="space-y-4">
                <input required type="text" name="bookTitle" placeholder="Título do livro" className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                <input required type="number" name="pagesRead" placeholder="Páginas lidas" min="1" className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />Registrar Leitura
                </button>
              </div>
            </form>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Activity className="w-6 h-6 mr-2 text-cyan-400" />Feed de Atividade</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {marathonData.atividades.map((activity, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-3 border-l-4 border-cyan-400">
                    <div className="text-sm text-white font-semibold">{activity.participantId}</div>
                    <div className="text-xs text-purple-300">
                      leu <span className="font-bold text-yellow-400">{activity.pagesRead}</span> páginas de <em>"{activity.bookTitle}"</em>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;