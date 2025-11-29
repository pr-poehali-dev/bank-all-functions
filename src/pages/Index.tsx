import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'topup' | 'purchase';
  amount: number;
  from?: string;
  to?: string;
  date: string;
  method?: string;
}

interface Terminal {
  id: string;
  name: string;
  price: number;
  created: string;
  revenue: number;
  qrCode: string;
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
  const [topupAmount, setTopupAmount] = useState('');
  const [topupCard, setTopupCard] = useState('');
  const [selectedBank, setSelectedBank] = useState('sberbank');
  const [isTopupDialogOpen, setIsTopupDialogOpen] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'receive', amount: 50, from: 'Система', date: '2025-11-29' }
  ]);

  const [terminals, setTerminals] = useState<Terminal[]>([]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'Первые шаги', description: 'Зарегистрируйтесь в системе', unlocked: true, icon: 'Rocket' },
    { id: '2', title: 'Первый перевод', description: 'Отправьте первый перевод', unlocked: false, icon: 'Send' },
    { id: '3', title: 'Предприниматель', description: 'Создайте свой терминал', unlocked: false, icon: 'Store' },
    { id: '4', title: 'Богатей', description: 'Накопите 1000₽', unlocked: false, icon: 'TrendingUp' },
    { id: '5', title: 'Первое пополнение', description: 'Пополните баланс с карты', unlocked: false, icon: 'CreditCard' },
    { id: '6', title: 'Первая продажа', description: 'Получите доход через терминал', unlocked: false, icon: 'Coins' },
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
    const newTerminal: Terminal = {
      id: Date.now().toString(),
      name: terminalName,
      price: price,
      created: new Date().toISOString().split('T')[0],
      revenue: 0,
      qrCode: `TERMINAL-${Date.now()}`
    };
    setTerminals(prev => [...prev, newTerminal]);

    toast.success(`🏪 Терминал "${terminalName}" создан!`);
    setTerminalName('');
    setTerminalPrice('');
    addXP(30);
    unlockAchievement('3');
  };

  const handleTopup = () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 100) {
      toast.error('Минимальная сумма пополнения 100₽');
      return;
    }

    if (!topupCard || topupCard.length < 16) {
      toast.error('Введите корректный номер карты');
      return;
    }

    toast.loading('Обработка платежа...');
    
    setTimeout(() => {
      setBalance(balance + amount);
      setTransactions(prev => [{
        id: Date.now().toString(),
        type: 'topup',
        amount: amount,
        from: selectedBank === 'sberbank' ? 'Сбербанк' : 'Тинькофф',
        date: new Date().toISOString().split('T')[0],
        method: 'card'
      }, ...prev]);

      toast.success(`✅ Баланс пополнен на ${amount}₽`);
      setTopupAmount('');
      setTopupCard('');
      setIsTopupDialogOpen(false);
      addXP(15);
      unlockAchievement('5');

      if (balance + amount >= 1000) {
        unlockAchievement('4');
      }
    }, 2000);
  };

  const handlePurchase = (terminal: Terminal) => {
    const amount = terminal.price;
    
    toast.loading('Обработка покупки...');
    
    setTimeout(() => {
      const updatedTerminals = terminals.map(t => 
        t.id === terminal.id ? { ...t, revenue: t.revenue + amount } : t
      );
      setTerminals(updatedTerminals);
      
      const commission = amount * 0.02;
      const netAmount = amount - commission;
      setBalance(balance + netAmount);

      setTransactions(prev => [{
        id: Date.now().toString(),
        type: 'purchase',
        amount: netAmount,
        from: `Покупка в "${terminal.name}"`,
        date: new Date().toISOString().split('T')[0],
        method: 'terminal'
      }, ...prev]);

      toast.success(`💰 Получен доход ${netAmount.toFixed(2)}₽ (комиссия 2%)`);
      addXP(20);
      unlockAchievement('6');

      if (balance + netAmount >= 1000) {
        unlockAchievement('4');
      }
    }, 1500);
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'topup') return 'ArrowDownToLine';
    if (type === 'purchase') return 'Coins';
    if (type === 'receive') return 'ArrowDown';
    return 'ArrowUp';
  };
  
  const getTransactionLabel = (type: string) => {
    if (type === 'topup') return 'Пополнение';
    if (type === 'purchase') return 'Доход';
    if (type === 'receive') return 'Получено';
    return 'Отправлено';
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
              <span className="hidden sm:inline">Кошелёк</span>
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <Icon name="Send" size={18} className="mr-2" />
              <span className="hidden sm:inline">Переводы</span>
            </TabsTrigger>
            <TabsTrigger value="terminals">
              <Icon name="Store" size={18} className="mr-2" />
              <span className="hidden sm:inline">Терминалы</span>
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Icon name="Trophy" size={18} className="mr-2" />
              <span className="hidden sm:inline">Награды</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <Card className="glass border-0 p-6 mb-4">
              <Dialog open={isTopupDialogOpen} onOpenChange={setIsTopupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-success hover:bg-success/90" size="lg">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Пополнить баланс
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-muted">
                  <DialogHeader>
                    <DialogTitle>Пополнение баланса</DialogTitle>
                    <DialogDescription>Выберите банк и введите данные карты</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Выберите банк</Label>
                      <RadioGroup value={selectedBank} onValueChange={setSelectedBank} className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2 glass p-3 rounded-lg cursor-pointer hover:bg-muted/20">
                          <RadioGroupItem value="sberbank" id="sberbank" />
                          <Label htmlFor="sberbank" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-success/20 rounded flex items-center justify-center">💚</div>
                              <span>Сбербанк</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 glass p-3 rounded-lg cursor-pointer hover:bg-muted/20">
                          <RadioGroupItem value="tinkoff" id="tinkoff" />
                          <Label htmlFor="tinkoff" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center">💛</div>
                              <span>Тинькофф</span>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label>Номер карты</Label>
                      <Input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={topupCard}
                        onChange={(e) => setTopupCard(e.target.value.replace(/\s/g, ''))}
                        className="glass border-muted"
                        maxLength={16}
                      />
                    </div>
                    <div>
                      <Label>Сумма пополнения</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        className="glass border-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Минимум 100₽</p>
                    </div>
                    <Button onClick={handleTopup} className="w-full bg-primary" size="lg">
                      <Icon name="CreditCard" size={20} className="mr-2" />
                      Оплатить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>

            <Card className="glass border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">История транзакций</h3>
                <Badge variant="outline">{transactions.length}</Badge>
              </div>
              <div className="space-y-3">
                {transactions.map(tx => {
                  const isPositive = tx.type === 'receive' || tx.type === 'topup' || tx.type === 'purchase';

                  return (
                    <div key={tx.id} className="glass rounded-lg p-4 flex items-center justify-between hover:bg-muted/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isPositive ? 'bg-success/20' : 'bg-destructive/20'}`}>
                          <Icon name={getTransactionIcon(tx.type)} size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{getTransactionLabel(tx.type)}</p>
                          <p className="text-sm text-muted-foreground">{tx.from || tx.to}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isPositive ? 'text-success' : 'text-foreground'}`}>
                          {isPositive ? '+' : '-'}{tx.amount.toFixed(2)}₽
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  );
                })}
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
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{terminal.name}</h4>
                          <p className="text-sm text-muted-foreground">Создан: {terminal.created}</p>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">{terminal.price}₽</Badge>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-success font-medium">Выручка: {terminal.revenue}₽</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="glass">
                              <Icon name="QrCode" size={16} className="mr-1" />
                              QR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass border-muted">
                            <DialogHeader>
                              <DialogTitle>{terminal.name}</DialogTitle>
                              <DialogDescription>QR-код для оплаты товаров/услуг</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 py-6">
                              <div className="bg-white p-6 rounded-xl">
                                <div className="text-6xl">📱</div>
                              </div>
                              <p className="text-center text-muted-foreground">
                                <span className="font-mono text-xs block">{terminal.qrCode}</span>
                              </p>
                              <p className="text-2xl font-bold">{terminal.price}₽</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Button 
                        onClick={() => handlePurchase(terminal)}
                        className="w-full bg-success/20 hover:bg-success/30 text-success border border-success/50"
                        size="sm"
                      >
                        <Icon name="ShoppingCart" size={16} className="mr-2" />
                        Тест покупки ({terminal.price}₽)
                      </Button>
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
