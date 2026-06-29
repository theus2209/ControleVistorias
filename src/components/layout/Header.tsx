import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, LogOut, DollarSign, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  onExport: () => void;
  onClearAll: () => void;
}

export const Header = ({ onExport, onClearAll }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleClearAll = () => {
    if (password === 'destak@2023') {
      onClearAll();
      setShowDialog(false);
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta!');
    }
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
    setPassword('');
    setError('');
  };

  const handleLogout = async () => {
    await authService.signOut();
    logout();
    navigate('/login');
  };

  return (
    <>
    <header className="border-b bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 sticky top-0 z-10 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
              DESTAK
            </h1>
            <p className="text-xs md:text-sm text-white/90 font-medium tracking-wide">
              vistorias veiculares
            </p>
          </div>
          
          <div className="flex-1 flex justify-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/90 font-medium hidden md:inline">
                {user?.username}
              </span>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="secondary" 
                size="sm"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white font-medium shadow-md border border-white/20"
              >
                <BarChart2 className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/gastos-creditos')} 
                variant="secondary" 
                size="sm"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white font-medium shadow-md border border-white/20"
              >
                <DollarSign className="h-4 w-4" />
                Gastos e Créditos
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                size="sm"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white font-medium shadow-md border border-white/20"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
            <Button 
              onClick={handleOpenDialog} 
              variant="secondary" 
              size="sm"
              className="gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Apagar todas vistorias</span>
            </Button>
            <Button 
              onClick={onExport} 
              variant="secondary" 
              size="sm"
              className="gap-2 bg-white hover:bg-gray-100 text-emerald-700 font-semibold shadow-md"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Gerar PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Esta ação irá apagar TODAS as vistorias cadastradas. Esta ação não pode ser desfeita.
            Digite a senha para confirmar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClearAll();
              }
            }}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowDialog(false);
              setPassword('');
              setError('');
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleClearAll}
          >
            Confirmar exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
