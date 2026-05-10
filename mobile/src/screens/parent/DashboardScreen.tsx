import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ParentSessionRepository, type WeeklySummary } from '../../storage/parentSessions'
import DailySummaryCard from '../../components/DailySummaryCard'

interface Props { selectedKidId: string }
const SE: Record<string,string> = { math:'🧮', english:'📖', science:'🔬', chinese:'🀄' }
function fmt(s: number): string { return String(Math.max(1, Math.round(s/60))) }
const TI: Record<string,string> = { up:'📈', down:'📉', stable:'➡️' }

export default function DashboardScreen({ selectedKidId }: Props) {
  const { t } = useTranslation()
  const [ws, setWs] = useState<WeeklySummary|null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    if (!selectedKidId) { setWs(null); setLoading(false); return }
    try { setWs(await ParentSessionRepository.getWeeklySummary(selectedKidId)) }
    catch { setWs(null) }
    finally { setLoading(false) }
  }, [selectedKidId])
  useEffect(() => { setLoading(true); load() }, [load])
  const onRefresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false) }, [load])
  if (!selectedKidId) return <View style={st.e}><Text style={st.ei}>{'👆'}</Text><Text style={st.et}>{t('parent.dashboard.selectKid')}</Text></View>
  if (loading) return <View style={st.e}><Text style={st.lt}>{t('common.loading')}</Text></View>
  if (!ws || ws.totalSessions === 0) return <View style={st.e}><Text style={st.ei}>{'📊'}</Text><Text style={st.et}>{t('parent.dashboard.noSessions')}</Text></View>
  return (
    <ScrollView style={st.c} contentContainerStyle={st.sc} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={st.st}>{t('parent.dashboard.thisWeek')}</Text>
      <View style={st.card}>
        <View style={st.wh}><Text style={st.ti}>{TI[ws.trend]}</Text><Text style={st.wt}>{t('parent.dashboard.weekOf',{date:ws.startDate}) as string}</Text></View>
        <View style={st.ws}>
          <View style={st.stat}><Text style={st.n}>{ws.totalSessions}</Text><Text style={st.l}>{t('parent.dashboard.sessions')}</Text></View>
          <View style={st.stat}><Text style={st.n}>{ws.totalQuestions}</Text><Text style={st.l}>{t('parent.dashboard.questions')}</Text></View>
          <View style={st.stat}><Text style={[st.n, ws.accuracyRate>=70?st.grn:st.amb]}>{ws.accuracyRate}%</Text><Text style={st.l}>{t('parent.dashboard.accuracy')}</Text></View>
          <View style={st.stat}><Text style={st.n}>{fmt(ws.totalTimeSeconds)}</Text><Text style={st.l}>{t('parent.dashboard.minutes')}</Text></View>
        </View>
        {ws.subjects.length>0 && <View style={st.sbj}>{ws.subjects.map(s=><View key={s} style={st.chip}><Text style={st.e_}>{SE[s]??'📚'}</Text><Text style={st.cl}>{t('kidHome.subjects.'+s,s) as string}</Text></View>)}</View>}
        {ws.struggleSessions>0 && <View style={st.sr}><Text style={st.si}>{'⚠️'}</Text><Text style={st.stxt}>{t('parent.dashboard.struggleCount',{count:ws.struggleSessions}) as string}</Text></View>}
      </View>
      {ws.dailySummaries.length>0 && <><Text style={[st.st,{marginTop:20}]}>{t('parent.dashboard.dailyBreakdown')}</Text>{ws.dailySummaries.map(d=><DailySummaryCard key={d.date} summary={d} />)}</>}
    </ScrollView>
  )
}
const st = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8F9FA'},sc:{padding:16,paddingBottom:32},
  st:{fontSize:18,fontWeight:'700',color:'#1A1A1A',marginBottom:12},
  card:{backgroundColor:'#FFF',padding:16,borderRadius:14,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.06,shadowRadius:3,elevation:1},
  wh:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:14},ti:{fontSize:20},wt:{fontSize:14,fontWeight:'600',color:'#6B7280'},
  ws:{flexDirection:'row',gap:8},stat:{flex:1,alignItems:'center'},
  n:{fontSize:26,fontWeight:'700',color:'#2563EB',marginBottom:2},grn:{color:'#16A34A'},amb:{color:'#D97706'},l:{fontSize:11,fontWeight:'500',color:'#9CA3AF'},
  sbj:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#F3F4F6'},
  chip:{flexDirection:'row',alignItems:'center',gap:4,paddingVertical:4,paddingHorizontal:10,backgroundColor:'#F3F4F6',borderRadius:12},
  e_:{fontSize:14},cl:{fontSize:12,fontWeight:'600',color:'#374151'},
  sr:{flexDirection:'row',alignItems:'center',gap:8,marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#F3F4F6'},
  si:{fontSize:16},stxt:{fontSize:13,fontWeight:'600',color:'#DC2626'},
  e:{alignItems:'center',justifyContent:'center',paddingVertical:64,gap:8},ei:{fontSize:36},et:{fontSize:15,color:'#9CA3AF',textAlign:'center'},lt:{fontSize:15,color:'#9CA3AF'},
})
