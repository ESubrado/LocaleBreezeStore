import React from 'react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
  <nav className="fixed top-0 left-0 w-full bg-white z-50 py-4 px-6 shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">Locale Breeze Store</span>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <span className="hover:text-blue-600 cursor-pointer">Home</span>
            </Link>
          </li>
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
