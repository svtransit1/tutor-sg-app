import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DailySummaryCard from '../DailySummaryCard';

const t=(k:string,o?:Record<string,unknown>)=>{const m:Record<string,string>={'parent.dashboard.sessions':'Sessions','parent.dashboard.questions':'Questions','parent.dashboard.accuracy':'Accuracy','parent.dashboard.time':'Time','parent.dashboard.summaryCardLabel':'Sum','parent.dashboard.struggleCount':'{{count}} diff','kidHome.subjects.math':'Math','kidHome.subjects.english':'English'};if(o){let v=m[k]??k;for(const[k2,v2]of Object.entries(o))v=v.replace('{{'+k2+'}}',String(v2));return v}return m[k]??k};
jest.mock('react-i18next',()=>({useTranslation:()=>({t})}));

const s={date:'2026-05-10',totalSessions:3,totalQuestions:12,totalCorrect:9,accuracyRate:75,totalTimeSeconds:3600,struggleSessions:1,subjects:['math','english'],perSubject:[{subject:'math',sessions:2,questions:8,correct:6,accuracyRate:75,totalTimeSeconds:2400},{subject:'english',sessions:1,questions:4,correct:3,accuracyRate:75,totalTimeSeconds:1200}]};

describe('DailySummaryCard',()=>{
  it('renders stats',()=>{render(<DailySummaryCard summary={s}/>);expect(screen.getByText('3')).toBeTruthy();expect(screen.getByText('12')).toBeTruthy()});
  it('renders struggle',()=>{render(<DailySummaryCard summary={s}/>);expect(screen.getByText('1 diff')).toBeTruthy()});
  it('hides struggle badge',()=>{render(<DailySummaryCard summary={{...s,struggleSessions:0}}/>);expect(screen.queryByText(/diff/)).toBeNull()});
});
