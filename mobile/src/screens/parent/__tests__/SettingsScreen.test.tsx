import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from '../SettingsScreen';
const t=(k:string)=>({'parent.settings.title':'Set'}[k]??k);
jest.mock('react-i18next',()=>({useTranslation:()=>({t})}));
describe('SettingsScreen',()=>{it('renders',()=>{render(<SettingsScreen/>);expect(screen.getByText('Set')).toBeTruthy()})});
