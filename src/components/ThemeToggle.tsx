'use client';
import {useEffect, useState} from 'react';
import {Moon, Sun} from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => { setDark(document.documentElement.dataset.theme !== 'light'); }, []);
  function toggle() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setDark(next === 'dark');
    try { localStorage.setItem('baby-swish-theme', next); } catch { /* Theme still works without storage. */ }
  }
  return <button className="theme-toggle" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
    {dark ? <Sun size={17}/> : <Moon size={17}/>}<span>{dark ? 'Light' : 'Dark'}</span>
  </button>;
}
