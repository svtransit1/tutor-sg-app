import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import KidSwitcher from '../KidSwitcher';
const t=(k:string)=>({'parent.kidSwitcher.label':'Sw','parent.kidSwitcher.switchChild':"V {{name}}"}[k]??k);
jest.mock('react-i18next',()=>({useTranslation:()=>({t})}));
jest.mock('../../../storage/kidProfiles',()=>({KidProfileRepository:{getProfiles:jest.fn().mockResolvedValue([{id:'k1',name:'Alice',avatarKey:'\u{1F467}'}]),setActiveKid:jest.fn()}}));
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0}),SafeAreaProvider:({children}:{children:React.ReactNode})=>children}));
describe('KidSwitcher',()=>{it('renders',async()=>{render(<KidSwitcher selectedId="k1" onSelectKid={()=>{}}/>);await act(async()=>{});expect(screen.getByText('Alice')).toBeTruthy()})});
