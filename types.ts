import * as THREE from 'three';

export enum AppState {
  TREE = 'TREE',
  CLOUD = 'CLOUD',
  FOCUS = 'FOCUS',
}

export interface OrnamentData {
  id: number;
  type: 'sphere' | 'cube' | 'candy';
  color: string;
  initialPos: THREE.Vector3;
  treePos: THREE.Vector3;
  cloudPos: THREE.Vector3;
}

export interface PhotoData {
  id: string;
  url: string;
  treePos: THREE.Vector3;
  cloudPos: THREE.Vector3;
  aspectRatio: number;
}

export type GestureType = 'None' | 'Closed_Fist' | 'Open_Palm' | 'Pointing_Up' | 'Thumb_Up' | 'Thumb_Down' | 'Victory' | 'ILoveYou';

export interface HandData {
  gesture: GestureType;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  isPinching: boolean;
  rotation: number; // Approximate hand roll
}
