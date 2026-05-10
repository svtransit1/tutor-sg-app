import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';

const t=(k:string,o?:Record<string,unknown>)=>{const m:Record<string,string>={'parent.dashboard.thisWeek':'TW','parent.dashboard.sessions':'Ses','parent.dashboard.questions':'Q','parent.dashboard.accuracy':'Acc','parent.dashboard.time':'T','parent.dashboard.minutes':'m','parent.dashboard.noSessions':'None.','parent.dashboard.weekOf':'Wk {{date}}','parent.dashboard.dailyBreakdown':'DB','parent.dashboard.struggleCount':'{{count}} diff','parent.dashboard.selectKid':'Pick kid','common.loading':'Load'};if(o){let v=m[k]??k;for(const[k2,v2]of Object.entries(o))v=v.replace('{{'+k2+'}}',String(v2));return v}return m[k]??k};
jest.mock('react-i18next',()=>({useTranslation:()=>({t})}));
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0}),SafeAreaProvider:({children}:{children:React.ReactNode})=>children}));
const mockGetWeeklySummary=jest.fn();
jest.mock('../../../storage/parentSessions',()=>({ParentSessionRepository:{getWeeklySummary:(...a:unknown[])=>mockGetWeeklySummary(...a)}}));
const wk=(o={})=>({startDate:'2026-05-04',endDate:'2026-05-10',totalSessions:5,totalQuestions:20,totalCorrect:15,accuracyRate:75,totalTimeSeconds:7200,struggleSessions:2,subjects:['math'],dailySummaries:[],trend:'stable',...o});

describe('DashboardScreen',()=>{
  beforeEach(()=>{jest.clearAllMocks();mockGetWeeklySummary.mockResolvedValue(wk())});
  it('pick kid',async()=>{render(<DashboardScreen selectedKidId=""/>);await act(async()=>{});expect(screen.getByText('Pick kid')).toBeTruthy()});
  it('shows weekly',async()=>{render(<DashboardScreen selectedKidId="k1"/>);await act(async()=>{});expect(screen.getByText('TW')).toBeTruthy();expect(screen.getByText('5')).toBeTruthy()});
  it('empty',async()=>{mockGetWeeklySummary.mockResolvedValue(wk({totalSessions:0}));render(<DashboardScreen selectedKidId="k1"/>);await act(async()=>{});expect(screen.getByText('None.')).toBeTruthy()});
  it('calls repo',async()=>{render(<DashboardScreen selectedKidId="k1"/>);await act(async()=>{});expect(mockGetWeeklySummary).toHaveBeenCalledWith('k1')});
});
