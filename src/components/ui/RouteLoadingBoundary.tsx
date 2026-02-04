import React from 'react';
import Loading from './Loading';

/**
 * Suspense fallback component for lazy-loaded routes.
 * Displays a loading spinner while route component is being loaded.
 */
export const RouteLoadingBoundary: React.FC = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Loading />
    </div>
  );
};
