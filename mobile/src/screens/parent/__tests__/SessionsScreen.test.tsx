import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import SessionsScreen from '../SessionsScreen';
const t=(k:string)=>({'parent.sessions.empty':'No s.','parent.sessions.filterAll':'All','parent.sessions.filterMath':'Math','parent.sessions.subject':'S','parent.sessions.questions':'Q','parent.sessions.struggleIndicators':'SI','parent.sessions.aiHelp':'AI','kidHome.subjects.math':'Math','parent.dashboard.flagSession':'F','parent.dashboard.flagged':'Fl'}[k]??k);
jest.mock('react-i18next',()=>({useTranslation:()=>({t,i18n:{language:'en'}})}));
jest.mock('../../../storage/parentSessions',()=>({ParentSessionRepository:{getSessionsForKid:jest.fn().mockResolvedValue([])}}));
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0}),SafeAreaProvider:({children}:{children:React.ReactNode})=>children}));
describe('SessionsScreen',()=>{it('renders',async()=>{render(<SessionsScreen selectedKidId=""/>);await act(async()=>{});expect(screen.getByText('No s.')).toBeTruthy()})});
