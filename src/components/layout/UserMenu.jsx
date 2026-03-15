import React from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const UserMenu = ({ user, count, onLogout }) => {
  return (
    <div className="hidden lg:block">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button 
            className="flex items-center gap-2 group p-0.5 rounded-full hover:scale-105 transition-transform focus-visible:outline-none"
            aria-label="User menu"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black text-white text-sm shadow-[0_5px_15px_rgba(193,55,44,0.4)] border-2 border-white/10 overflow-hidden ring-offset-2 ring-offset-[#20151A] group-hover:ring-2 ring-primary/50 transition-all">
              {user.name.charAt(0)}
            </div>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            className="w-56 bg-background border border-muted/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-200"
            sideOffset={8}
            align="end"
          >
            <div className="p-3 border-b border-muted/10 bg-surface/20">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-muted/70 truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <DropdownMenu.Item asChild>
                <Link to="/profile" className="flex outline-none items-center gap-3 px-3 py-2 text-sm text-muted hover:bg-white/5 data-[highlighted]:bg-white/5 data-[highlighted]:text-white hover:text-white rounded-lg cursor-pointer transition-colors">
                  <User size={16} /> Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/watchlist" className="flex outline-none items-center justify-between px-3 py-2 text-sm text-muted hover:bg-white/10 data-[highlighted]:bg-white/10 data-[highlighted]:text-white hover:text-white rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3"><Heart size={16} /> Watchlist</div>
                  {count > 0 && <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/10">{count}</span>}
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-muted/10 my-1 mx-2" />
              <DropdownMenu.Item asChild>
                <button onClick={onLogout} className="w-full text-left outline-none flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/5 data-[highlighted]:bg-primary/5 hover:text-red-300 data-[highlighted]:text-red-300 rounded-lg cursor-pointer transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

export default UserMenu;
