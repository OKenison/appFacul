import { useMemo, useState } from 'react';

type Priority = 'Alta' | 'Média' | 'Baixa';

type Task = {
  id: number;
  title: string;
  subject: string;
  priority: Priority;
  dueDate: string;
  notes: string;
  completed: boolean;
  xpReward: number;
};

type QuizQuestion = {
  id: number;
  question: string;
  choices: string[];
  answerIndex: number;
  xp: number;
};

type Activity = {
  id: number;
  message: string;
  xp: number;
  date: string;
};

type Tab = 'Home' | 'Tarefas' | 'Quiz' | 'Explorar' | 'Perfil';

const starterTasks: Task[] = [
  {
    id: 1,
    title: 'Exercício de Geometria',
    subject: 'Matemática',
    priority: 'Alta',
    dueDate: '2026-03-15',
    notes: 'Focar em semelhança de triângulos',
    completed: false,
    xpReward: 20
  },
  {
    id: 2,
    title: 'Avaliação de História',
    subject: 'História',
    priority: 'Média',
    dueDate: '2026-03-20',
    notes: 'Revisar Guerra Fria e globalização',
    completed: false,
    xpReward: 15
  },
  {
    id: 3,
    title: 'Atividade de Química',
    subject: 'Química',
    priority: 'Baixa',
    dueDate: '2026-03-25',
    notes: 'Tabela periódica e ligações',
    completed: true,
    xpReward: 5
  }
];

const quizzes: QuizQuestion[] = [
  {
    id: 1,
    question: 'No contexto da globalização, uma zona de livre comércio se caracteriza por:',
    choices: [
      'Unificação de políticas internacionais',
      'Livre circulação de pessoas e capitais',
      'Moeda única entre países',
      'Livre circulação de mercadorias entre países membros'
    ],
    answerIndex: 3,
    xp: 10
  },
  {
    id: 2,
    question: 'Qual técnica ajuda a manter foco nos estudos?',
    choices: ['Método Pomodoro', 'Multitarefa contínua', 'Estudar sem pausas', 'Dormir menos'],
    answerIndex: 0,
    xp: 10
  }
];

const assistantTips = [
  'Olá Mario! Estude pelo menos 30 minutos por dia até a avaliação.',
  'Falta 1 semana para sua prova de História. Revise 2 tópicos por dia.',
  'ENEM: lembrete para revisar redação no sábado às 10h.'
];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, message: 'Exercício concluído', xp: 5, date: 'Hoje' },
    { id: 2, message: 'Quiz concluído', xp: 10, date: 'Ontem' }
  ]);
  const [xp, setXp] = useState(35);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'xpReward'>>({
    title: '',
    subject: '',
    priority: 'Média',
    dueDate: '',
    notes: ''
  });
  const [quizIndex, setQuizIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [settings, setSettings] = useState({
    language: 'Português',
    darkMode: true,
    notifications: true,
    account: 'mario@email.com',
    permissions: 'Ativas'
  });

  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const level = Math.floor(xp / 50) + 1;
  const progressInLevel = (xp % 50) * 2;

  const achievements = useMemo(
    () => [
      { title: 'Primeiros passos', done: xp >= 10 },
      { title: 'Semana disciplinada', done: completedTasks.length >= 3 },
      { title: 'Mestre do Quiz', done: activities.filter((act) => act.message.includes('Quiz')).length >= 2 }
    ],
    [xp, completedTasks.length, activities]
  );

  const addTask = () => {
    if (!newTask.title || !newTask.subject || !newTask.dueDate) return;

    const priorityXp = newTask.priority === 'Alta' ? 20 : newTask.priority === 'Média' ? 10 : 5;

    setTasks((prev) => [
      ...prev,
      {
        ...newTask,
        id: Date.now(),
        completed: false,
        xpReward: priorityXp
      }
    ]);

    setNewTask({ title: '', subject: '', priority: 'Média', dueDate: '', notes: '' });
  };

  const completeTask = (id: number) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || task.completed) return;

    setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, completed: true } : item)));
    setXp((prev) => prev + task.xpReward);
    setActivities((prev) => [
      { id: Date.now(), message: `Tarefa importante: ${task.title}`, xp: task.xpReward, date: 'Agora' },
      ...prev
    ]);
  };

  const answerQuiz = (choiceIndex: number) => {
    const current = quizzes[quizIndex];
    if (choiceIndex === current.answerIndex) {
      setFeedback(`Correto! +${current.xp} XP`);
      setXp((prev) => prev + current.xp);
      setActivities((prev) => [
        { id: Date.now(), message: 'Quiz concluído', xp: current.xp, date: 'Agora' },
        ...prev
      ]);
    } else {
      setFeedback('Resposta incorreta. Continue tentando!');
    }
  };

  const nextQuiz = () => {
    setQuizIndex((prev) => (prev + 1) % quizzes.length);
    setFeedback('');
  };

  const currentQuiz = quizzes[quizIndex];

  return (
    <div className={`app ${settings.darkMode ? 'dark' : 'light'}`}>
      <header className="header card">
        <div>
          <h1>StudyFlow</h1>
          <p>Organize, estude e evolua todos os dias.</p>
        </div>
        <div className="xp-box">
          <strong>XP: {xp}</strong>
          <span>Nível {level}</span>
          <div className="progress-bar">
            <div style={{ width: `${progressInLevel}%` }} />
          </div>
        </div>
      </header>

      {activeTab === 'Home' && (
        <section className="grid">
          <article className="card">
            <h2>Resumo rápido</h2>
            <p>Pendentes: {pendingTasks.length}</p>
            <p>Concluídas: {completedTasks.length}</p>
            <p>Próxima entrega: {pendingTasks[0]?.dueDate ?? 'Sem prazos próximos'}</p>
          </article>

          <article className="card">
            <h2>Assistente Inteligente</h2>
            {assistantTips.map((tip) => (
              <p key={tip} className="bubble">
                {tip}
              </p>
            ))}
          </article>

          <article className="card">
            <h2>Conquistas</h2>
            <ul>
              {achievements.map((achievement) => (
                <li key={achievement.title}>{achievement.done ? '🏆' : '⬜'} {achievement.title}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Histórico de atividades</h2>
            <ul>
              {activities.map((activity) => (
                <li key={activity.id}>
                  {activity.message} ({activity.date}) <strong>+{activity.xp} XP</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {activeTab === 'Tarefas' && (
        <section className="grid">
          <article className="card">
            <h2>Planejamento de Estudos</h2>
            <input
              placeholder="Título da tarefa"
              value={newTask.title}
              onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              placeholder="Matéria"
              value={newTask.subject}
              onChange={(event) => setNewTask((prev) => ({ ...prev, subject: event.target.value }))}
            />
            <select
              value={newTask.priority}
              onChange={(event) =>
                setNewTask((prev) => ({ ...prev, priority: event.target.value as Priority }))
              }
            >
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(event) => setNewTask((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
            <textarea
              placeholder="Observações"
              value={newTask.notes}
              onChange={(event) => setNewTask((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <button onClick={addTask}>Adicionar tarefa</button>
          </article>

          <article className="card">
            <h2>Tarefas pendentes</h2>
            {pendingTasks.map((task) => (
              <div key={task.id} className="task">
                <div>
                  <strong>{task.title}</strong>
                  <p>
                    {task.subject} • {task.priority} • até {task.dueDate}
                  </p>
                  <small>{task.notes}</small>
                </div>
                <button onClick={() => completeTask(task.id)}>Concluir (+{task.xpReward} XP)</button>
              </div>
            ))}
          </article>

          <article className="card">
            <h2>Tarefas concluídas</h2>
            <ul>
              {completedTasks.map((task) => (
                <li key={task.id}>
                  ✅ {task.title} ({task.subject})
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {activeTab === 'Quiz' && (
        <section className="grid">
          <article className="card">
            <h2>Quiz Interativo</h2>
            <p>{currentQuiz.question}</p>
            <div className="choices">
              {currentQuiz.choices.map((choice, index) => (
                <button key={choice} onClick={() => answerQuiz(index)}>
                  {String.fromCharCode(65 + index)}) {choice}
                </button>
              ))}
            </div>
            {feedback && <p className="feedback">{feedback}</p>}
            <button onClick={nextQuiz}>Próxima pergunta</button>
          </article>
        </section>
      )}

      {activeTab === 'Explorar' && (
        <section className="grid">
          <article className="card">
            <h2>Notícias educacionais</h2>
            <ul>
              <li>Novo cronograma do ENEM divulgado para este ano.</li>
              <li>Universidades ampliam bolsas em áreas de tecnologia.</li>
            </ul>
          </article>
          <article className="card">
            <h2>Dicas de estudo</h2>
            <ul>
              <li>Use revisões espaçadas ao longo da semana.</li>
              <li>Crie blocos de estudo de 25 minutos (Pomodoro).</li>
              <li>Intercale matérias para melhorar retenção.</li>
            </ul>
          </article>
          <article className="card">
            <h2>Habilidades do futuro</h2>
            <ul>
              <li>Pensamento crítico e resolução de problemas.</li>
              <li>Alfabetização digital e análise de dados.</li>
              <li>Comunicação e colaboração interdisciplinar.</li>
            </ul>
          </article>
          <article className="card">
            <h2>Planejamento de carreira</h2>
            <p>Defina metas trimestrais, conecte estudos com profissões e monitore evolução.</p>
          </article>
        </section>
      )}

      {activeTab === 'Perfil' && (
        <section className="grid">
          <article className="card">
            <h2>Perfil do estudante</h2>
            <p><strong>Nome:</strong> Mario Costa</p>
            <p><strong>Idade:</strong> 19 anos</p>
            <p><strong>Nacionalidade:</strong> Brasileira</p>
            <p><strong>Matéria favorita:</strong> Geografia</p>
            <p><strong>Hobbies:</strong> Futebol, leitura e música</p>
            <p><strong>XP acumulado:</strong> {xp}</p>
          </article>

          <article className="card">
            <h2>Configurações</h2>
            <label>
              Idioma
              <select
                value={settings.language}
                onChange={(event) => setSettings((prev) => ({ ...prev, language: event.target.value }))}
              >
                <option>Português</option>
                <option>English</option>
              </select>
            </label>
            <label className="inline">
              Tema escuro
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, darkMode: event.target.checked }))
                }
              />
            </label>
            <label className="inline">
              Notificações
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, notifications: event.target.checked }))
                }
              />
            </label>
            <p><strong>Conta:</strong> {settings.account}</p>
            <p><strong>Permissões:</strong> {settings.permissions}</p>
          </article>
        </section>
      )}

      <nav className="tabs">
        {(['Home', 'Tarefas', 'Quiz', 'Explorar', 'Perfil'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
