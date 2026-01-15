import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';

import React from 'react'

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const tags = useQuery(api.notes.getUserTags, user ? { userId: user.id } : "skip");
  
  const isActive = (path) => {
      if (path === "/") return location.pathname === "/";
    
      return location.pathname.startsWith(path);
    }

  return (
    <div className='w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen relative'>
      Sidebar
    </div>
  )
}
