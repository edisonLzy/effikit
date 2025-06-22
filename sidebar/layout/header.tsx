import React from 'react';
import { useNavigate } from 'react-router';
import { Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Logo组件 - 点击跳转到首页
export function Logo() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">E</span>
      </div>
      <span className="text-lg font-semibold text-gray-100">EffiKit</span>
    </button>
  );
}

// Profile组件 - 头像按钮作为Dropdown Menu的trigger
export function Profile() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 cursor-pointer rounded-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 transition-all duration-200"
        >
          <User className="w-5 h-5 text-gray-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="text-gray-200">我的账户</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-200 hover:bg-gray-700 hover:text-gray-100">
          <Settings className="mr-2 h-4 w-4" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-200 hover:bg-gray-700 hover:text-gray-100">
          <span>关于 EffiKit</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
