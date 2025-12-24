import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import * as THREE from 'three';
import GestureManager from './components/GestureManager';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { AppState, HandData, OrnamentData, PhotoData } from './types';
import { getTreePosition, getCloudPosition } from './utils/math';

// Initial constants
const ORNAMENT_COUNT = 300;
const INITIAL_COLORS = ['#FFD700', '#BB2528', '#2F5A2F', '#FFFFFF'];

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.TREE);
  const [handData, setHandData] = useState<HandData>({ 
    gesture: 'None', x: 0.5, y: 0.5, isPinching: false, rotation: 0 
  });
  
  // Data for ornaments
  const ornaments = useMemo<OrnamentData[]>(() => {
    return Array.from({ length: ORNAMENT_COUNT }).map((_, i) => {
      const typeRand = Math.random();
      const type = typeRand > 0.6 ? 'sphere' : (typeRand > 0.3 ? 'cube' : 'sphere'); // mostly spheres and cubes
      return {
        id: i,
        type: type as any,
        color: INITIAL_COLORS[Math.floor(Math.random() * INITIAL_COLORS.length)],
        initialPos: getCloudPosition(10), // Start random
        treePos: getTreePosition(i, ORNAMENT_COUNT),
        cloudPos: getCloudPosition(8),
      };
    });
  }, []);

  // Data for photos
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);

  // Handle Photo Upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: PhotoData[] = Array.from(e.target.files).map((file) => {
        const url = URL.createObjectURL(file as Blob);
        // We calculate positions for the new photo
        const id = Math.random().toString(36).substr(2, 9);
        // Place in tree at random spots near bottom/middle
        const treeIdx = Math.floor(Math.random() * (ORNAMENT_COUNT / 2)); 
        const treePos = getTreePosition(treeIdx, ORNAMENT_COUNT).add(new THREE.Vector3(0, 0, 0.5)); // slight offset
        
        return {
            id,
            url,
            treePos: treePos,
            cloudPos: getCloudPosition(6),
            aspectRatio: 1, // Will be handled by Image component automatically mostly
        };
      });
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  // Gesture State Logic
  useEffect(() => {
    if (handData.gesture === 'Closed_Fist') {
      setAppState(AppState.TREE);
      setFocusedPhotoId(null);
    } else if (handData.gesture === 'Open_Palm') {
       // Only switch to cloud if we aren't currently focusing tightly or if we want to cancel focus
       if (appState !== AppState.CLOUD) {
          setAppState(AppState.CLOUD);
       }
    } 
    
    // Pinch to Focus logic
    if (handData.isPinching && appState === AppState.CLOUD && photos.length > 0) {
        // Debounce or simple toggle could be complex, let's just pick a random one or the first one if not focused
        if (appState !== AppState.FOCUS) {
            setAppState(AppState.FOCUS);
            // In a real spatial app, we would find the closest photo to the hand cursor. 
            // Here, we just pick the next available one for the demo experience.
            const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
            setFocusedPhotoId(randomPhoto.id);
        }
    }
    
    // Release pinch doesn't necessarily mean exit focus, but Open Palm does.
  }, [handData.gesture, handData.isPinching, photos, appState]);


  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-[#050505] to-[#1a0b0b]">
      
      <GestureManager onHandUpdate={setHandData} />

      <Canvas
        shadows
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      >
        <Experience 
          appState={appState} 
          handData={handData} 
          ornaments={ornaments}
          photos={photos}
          focusedPhotoId={focusedPhotoId}
        />
      </Canvas>
      
      <UI onUpload={handleUpload} appState={appState} handData={handData} />
      
      <Loader 
        containerStyles={{ background: '#000' }} 
        innerStyles={{ width: '300px', height: '10px', background: '#333' }}
        barStyles={{ background: '#FFD700', height: '10px' }}
        dataStyles={{ color: '#FFD700', fontFamily: 'serif' }}
      />
    </div>
  );
}

export default App;