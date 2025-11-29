import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  from?: string;
  to?: string;
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const Index = () => {
  const [balance, setBalance] = useState(50);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientCard, setRecipientCard] = useState('');
  const [terminalName, setTerminalName] = useState('');
  const [terminalPrice, setTerminalPrice] = useState('');
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'receive', amount: 50, from: 'Система', date: '2025-11-29' }
  ]);

  const [terminals, setTerminals] = useState<any[]>([]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'Первые шаги', description: 'Зарегистрируйтесь в системе', unlocked: true, icon: 'Rocket' },
    { id: '2', title: 'Первый перевод', description: 'Отправьте первый перевод', unlocked: false, icon: 'Send' },
    { id: '3', title: 'Предприниматель', description: 'Создайте свой терминал', unlocked: false, icon: 'Store' },
    { id: '4', title: 'Богатей', description: 'Накопите 1000₽', unlocked: false, icon: 'TrendingUp' },
  ]);

  const xpToNextLevel = level * 100;
  const xpProgress = (xp / xpToNextLevel) * 100;

  const addXP = (amount: number) => {
    const newXP = xp + amount;
    if (newXP >= xpToNextLevel) {
      setLevel(level + 1);
      setXp(newXP - xpToNextLevel);
      toast.success(`🎉 Поздравляем! Вы достигли ${level + 1} уровня!`);
    } else {
      setXp(newXP);
    }
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => 
      prev.map(a => a.id === id && !a.unlocked ? { ...a, unlocked: true } : a)
    );
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      toast.success(`🏆 Достижение разблокировано: ${achievement.title}`);
      addXP(50);
    }
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0 || amount > balance) {
      toast.error('Некорректная сумма перевода');
      return;
    }
    if (!recipientCard) {
      toast.error('Укажите номер карты получателя');
      return;
    }

    const fee = amount * 0.01;
    const total = amount + fee;

    if (total > balance) {
      toast.error('Недостаточно средств с учетом комиссии 1%');
      return;
    }

    setBalance(balance - total);
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'send',
      amount: amount,
      to: recipientCard,
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);

    toast.success(`✅ Переведено ${amount}₽ (комиссия ${fee.toFixed(2)}₽)`);
    setTransferAmount('');
    setRecipientCard('');
    addXP(10);
    unlockAchievement('2');

    if (balance >= 1000) {
      unlockAchievement('4');
    }
  };

  const handleCreateTerminal = () => {
    const price = parseFloat(terminalPrice);
    if (!terminalName || !price || price < 50) {
      toast.error('Заполните все поля. Минимальная цена 50₽');
      return;
    }

    const fee = 50;
    if (balance < fee) {
      toast.error('Недостаточно средств. Создание терминала стоит 50₽');
      return;
    }

    setBalance(balance - fee);
    setTerminals(prev => [...prev, {
      id: Date.now().toString(),
      name: terminalName,
      price: price,
      created: new Date().toISOString().split('T')[0],
      revenue: 0
    }]);

    toast.success(`🏪 Терминал "${terminalName}" создан!`);
    setTerminalName('');
    setTerminalPrice('');
    addXP(30);
    unlockAchievement('3');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="glass rounded-2xl p-6 animate-fade-in glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">GameBank</h1>
              <p className="text-muted-foreground">Твой игровой финтех-банк</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  <Icon name="Zap" size={16} className="mr-1" />
                  Уровень {level}
                </Badge>
              </div>
              <div className="w-48">
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{xp} / {xpToNextLevel} XP</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 bg-gradient-to-br from-primary/20 to-secondary/20">
            <p className="text-sm text-muted-foreground mb-2">Баланс</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-bold text-white">{balance.toFixed(2)}</h2>
              <span className="text-2xl text-muted-foreground">₽</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="wallet" className="animate-slide-up">
          <TabsList className="grid w-full grid-cols-4 glass">
            <TabsTrigger value="wallet">
              <Icon name="Wallet" size={18} className="mr-2" />
              Кошелёк
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <Icon name="Send" size={18} className="mr-2" />
              Переводы
            </TabsTrigger>
            <TabsTrigger value="terminals">
              <Icon name="Store" size={18} className="mr-2" />
              Терминалы
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Icon name="Trophy" size={18} className="mr-2" />
              Достижения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <Card className="glass border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">История транзакций</h3>
                <Badge variant="outline">{transactions.length}</Badge>
              </div>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="glass rounded-lg p-4 flex items-center justify-between hover:bg-muted/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                        <Icon name={tx.type === 'receive' ? 'ArrowDown' : 'ArrowUp'} size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.type === 'receive' ? 'Получено' : 'Отправлено'}</p>
                        <p className="text-sm text-muted-foreground">{tx.from || tx.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'receive' ? 'text-success' : 'text-foreground'}`}>
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount}₽
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <Card className="glass border-0 p-6">
              <h3 className="text-xl font-semibold mb-4">Перевод с карты на карту</h3>
              <div className="space-y-4">
                <div>
                  <Label>Номер карты получателя</Label>
                  <Input 
                    placeholder="0000 0000 0000 0000" 
                    value={recipientCard}
                    onChange={(e) => setRecipientCard(e.target.value)}
                    className="glass border-muted"
                  />
                </div>
                <div>
                  <Label>Сумма</Label>
                  <Input 
                    type="number" 
                    placeholder="100" 
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="glass border-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Комиссия: 1% от суммы</p>
                </div>
                <Button 
                  onClick={handleTransfer} 
                  className="w-full bg-primary hover:bg-primary/90 animate-pulse-glow"
                  size="lg"
                >
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить перевод
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="terminals" className="space-y-4">
            <Card className="glass border-0 p-6">
              <h3 className="text-xl font-semibold mb-4">Создать терминал</h3>
              <div className="space-y-4">
                <div>
                  <Label>Название терминала</Label>
                  <Input 
                    placeholder="Моя кофейня" 
                    value={terminalName}
                    onChange={(e) => setTerminalName(e.target.value)}
                    className="glass border-muted"
                  />
                </div>
                <div>
                  <Label>Стоимость услуги/товара</Label>
                  <Input 
                    type="number" 
                    placeholder="50" 
                    value={terminalPrice}
                    onChange={(e) => setTerminalPrice(e.target.value)}
                    className="glass border-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Стоимость создания: 50₽</p>
                </div>
                <Button 
                  onClick={handleCreateTerminal}
                  className="w-full bg-accent hover:bg-accent/90"
                  size="lg"
                >
                  <Icon name="Store" size={20} className="mr-2" />
                  Создать за 50₽
                </Button>
              </div>
            </Card>

            {terminals.length > 0 && (
              <Card className="glass border-0 p-6">
                <h3 className="text-xl font-semibold mb-4">Мои терминалы</h3>
                <div className="grid gap-4">
                  {terminals.map(terminal => (
                    <div key={terminal.id} className="glass rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{terminal.name}</h4>
                        <Badge variant="secondary">{terminal.price}₽</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Создан: {terminal.created}</p>
                      <p className="text-sm text-success mt-1">Выручка: {terminal.revenue}₽</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <Card 
                  key={achievement.id} 
                  className={`glass border-0 p-6 transition-all ${achievement.unlocked ? 'glow' : 'opacity-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted/20'}`}>
                      <Icon name={achievement.icon as any} size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge variant="default" className="mt-2">
                          <Icon name="Check" size={14} className="mr-1" />
                          Разблокировано
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <Icon name="HelpCircle" size={16} className="inline mr-1" />
            Нужна помощь?
          </p>
          <Button variant="ghost" size="sm">
            <Icon name="MessageCircle" size={16} className="mr-2" />
            Поддержка
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
