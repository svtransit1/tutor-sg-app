import React from 'react';
export const CameraType = {front:'front',back:'back'};
export const FlashMode = {off:'off',on:'on',auto:'auto'};
export const CameraView: React.FC<{style?:any;children?:React.ReactNode}> = ({style,children}) => React.createElement('View',{style},children);
export function useCameraPermissions() { return [{granted:true},jest.fn()] as const; }
