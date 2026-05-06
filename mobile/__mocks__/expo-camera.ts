import React from 'react';

export const CameraType = { front: 'front', back: 'back' };
export const FlashMode = { on: 'on', off: 'off', auto: 'auto' };

export const CameraView = React.forwardRef((props: any, ref: any) =>
  React.createElement('CameraView', props),
);

export const useCameraPermissions = jest
  .fn()
  .mockReturnValue([{ granted: true, canAskAgain: true }, jest.fn()]);

export default { CameraView, CameraType, FlashMode, useCameraPermissions };
