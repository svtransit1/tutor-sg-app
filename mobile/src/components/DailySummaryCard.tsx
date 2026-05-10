import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { DailySummary } from '../storage/parentSessions'

interface Props { summary: DailySummary }
const SE: Record<string,string> = { math:'🧮', english:'📖', science:'🔬', chinese:'🀄' }
function fd(iso:string):string{try{return new Date(iso+'T00:00:00').toLocaleDateString('en-SG',{weekday:'short',day:'numeric',month:'short'})}catch{return iso}}
function fm(s:number):string{return Math.max(1,Math.round(s/60))+' min'}

export default function DailySummaryCard({ summary: x }: Props) {
  const { t } = useTranslation()
  return (
    <View style={ss.card} accessibilityRole="header" accessibilityLabel={t('parent.dashboard.summaryCardLabel',{date:x.date}) as string}>
      <Text style={ss.dl}>{fd(x.date)}</Text>
      <View style={ss.sr}>
        <View style={ss.stat}><Text style={ss.n}>{x.totalSessions}</Text><Text style={ss.l}>{t('parent.dashboard.sessions')}</Text></View>
        <View style={ss.stat}><Text style={ss.n}>{x.totalQuestions}</Text><Text style={ss.l}>{t('parent.dashboard.questions')}</Text></View>
        <View style={ss.stat}><Text style={[ss.n,x.accuracyRate>=70?ss.grn:ss.amb]}>{x.accuracyRate}%</Text><Text style={ss.l}>{t('parent.dashboard.accuracy')}</Text></View>
        <View style={ss.stat}><Text style={ss.n}>{fm(x.totalTimeSeconds)}</Text><Text style={ss.l}>{t('parent.dashboard.time')}</Text></View>
      </View>
      {x.struggleSessions>0&&<View style={ss.sb}><Text style={ss.stxt}>{t('parent.dashboard.struggleCount',{count:x.struggleSessions}) as string}</Text></View>}
      {x.perSubject.length>1&&<View style={ss.subjR}>{x.perSubject.map((s:any)=><View key={s.subject} style={ss.chip}><Text style={ss.e}>{SE[s.subject]??'📚'}</Text><Text style={ss.cl}>{t('kidHome.subjects.'+s.subject,s.subject) as string}</Text><Text style={ss.ca}>{s.accuracyRate}%</Text></View>)}</View>}
    </View>
  )
}
const ss = StyleSheet.create({
  card:{backgroundColor:'#FFF',padding:16,borderRadius:14,marginBottom:10,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.06,shadowRadius:3,elevation:1},
  dl:{fontSize:15,fontWeight:'700',color:'#1A1A1A',marginBottom:10},sr:{flexDirection:'row',gap:8},
  stat:{flex:1,alignItems:'center'},n:{fontSize:22,fontWeight:'700',color:'#2563EB',marginBottom:2},
  grn:{color:'#16A34A'},amb:{color:'#D97706'},l:{fontSize:11,fontWeight:'500',color:'#9CA3AF'},
  sb:{marginTop:10,paddingVertical:6,paddingHorizontal:10,backgroundColor:'#FEF2F2',borderRadius:8,alignSelf:'flex-start'},
  stxt:{fontSize:12,fontWeight:'600',color:'#DC2626'},
  subjR:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:10},
  chip:{flexDirection:'row',alignItems:'center',gap:4,paddingVertical:4,paddingHorizontal:10,backgroundColor:'#F3F4F6',borderRadius:12},
  e:{fontSize:14},cl:{fontSize:12,fontWeight:'600',color:'#374151'},ca:{fontSize:12,fontWeight:'700',color:'#6B7280'},
})
