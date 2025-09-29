"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  return (
    <nav className="py-4 px-6 shadow-md w-full sticky top-0z-10">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">Locale Breeze Store</span>
        <ul className="flex space-x-6">
          {pathname !== '/' && (
          <li>
            <Link href="/">
              <span className="hover:text-blue-600 cursor-pointer">Home</span>
            </Link>
          </li>
          )}
          <li>
            <Link href="/products">
              <span className="hover:text-blue-600 cursor-pointer">Products</span>
            </Link>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
