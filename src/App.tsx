
import React from 'react';
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";
import { measurePerformance, registerConnectivityListeners, preloadCriticalResources } from './utils/performance';
import { toast } from 'sonner';
import { auth } from './integrations/firebase/client';

const App: React.FC = () => {
  const [isReady, setIsReady] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const initAttempted = React.useRef(false);

  // Debug logging for initialization state
  React.useEffect(() => {
    console.log(`App state: isReady=${isReady}, isInitializing=${isInitializing}`);
  }, [isReady, isInitializing]);

  // Add a safety timeout to prevent app from being stuck in loading state
  React.useEffect(() => {
    if (isReady) return;
    
    const safetyTimeout = setTimeout(() => {
      console.warn('App initialization safety timeout reached. Forcing app to load.');
      setIsInitializing(false);
      setIsReady(true);
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(safetyTimeout);
  }, [isReady]);

  React.useEffect(() => {
    // Prevent multiple initialization attempts
    if (initAttempted.current) return;
    initAttempted.current = true;
    
    // Initialize app in a controlled sequence
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Step 1: Measure app performance
        measurePerformance();
        
        // Step 2: Verify Firebase is initialized
        console.log('Firebase Auth initialized:', !!auth);
        
        // Step 3: Preload critical resources with timeout
        try {
          await Promise.race([
            preloadCriticalResources([
              '/lovable-uploads/ed1f3f9a-22a0-42de-a8cb-354fb8c82dae.png'
            ]),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Preloading timed out')), 3000)
            )
          ]);
        } catch (error) {
          console.warn('Resource preloading incomplete:', error);
          // Continue with app initialization despite preloading issues
        }
        
        // Step 4: Register connectivity listeners
        registerConnectivityListeners(
          // Online callback
          () => {
            toast.success('You are back online!', {
              id: 'network-status',
              duration: 2000
            });
          },
          // Offline callback
          () => {
            toast.error('You are offline. Some features may be unavailable.', {
              id: 'network-status',
              duration: 5000
            });
          }
        );
        
        console.log('App initialization complete');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Log the specific error for debugging
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      } finally {
        // Always mark app as ready when initialization completes or fails
        console.log('Finalizing initialization, regardless of success/failure');
        setIsInitializing(false);
        setIsReady(true);
      }
    };
    
    // Start initialization process
    initializeApp();
    
  }, []); // Empty dependency array so it only runs once
  
  // Return null during initialization to avoid premature rendering
  if (!isReady) {
    return null;
  }
  
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
