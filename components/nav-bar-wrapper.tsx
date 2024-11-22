"use client";

import { usePathname } from 'next/navigation';
import { NavBar } from './nav-bar';

export function NavBarWrapper() {
  const pathname = usePathname();
  
  // Hide NavBar on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }
  
  return <NavBar />;
}
