import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PinGateScreen from '../PinGateScreen';
const t=(k:string)=>({'parentAuth.enterPin':'PIN','common.submit':'OK'}[k]??k);
jest.mock('react-i18next',()=>({useTranslation:()=>({t})}));
jest.mock('../../../storage/pin-storage',()=>({verifyPin:jest.fn(),savePin:jest.fn()}));
describe('PinGateScreen',()=>{it('renders',()=>{render(<PinGateScreen onSuccess={()=>{}}/>);expect(screen.getByText('PIN')).toBeTruthy()})});
