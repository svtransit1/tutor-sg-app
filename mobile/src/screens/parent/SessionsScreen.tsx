import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ParentSessionRepository, type ParentSession } from '../../storage/parentSessions';

const SUBJECTS = ['math','english','science','chinese'] as const;
const SE: Record<string,string> = { math:'🧮', english:'📖', science:'🔬', chinese:'🀄' };

interface Props { selectedKidId: string }

function fd(iso: string): string { try { return new Date(iso).toLocaleDateString('en-SG', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) } catch { return iso } }
function dur(s: string, e: string|null): string { try { return Math.max(1, Math.round((((e?new Date(e):new Date()).getTime()-new Date(s).getTime())/60000)))+' min' } catch { return '-' } }

export default function SessionsScreen({ selectedKidId }: Props) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<ParentSession[]>([]);
  const [filter, setFilter] = useState<string|null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const load = useCallback(async () => { try { if (selectedKidId) setSessions(await ParentSessionRepository.getSessionsForKid(selectedKidId)); else setSessions([]) } catch { setSessions([]) } }, [selectedKidId]);
  useEffect(() => { load() }, [load]);
  const onRefresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false) }, [load]);

  const filtered = filter ? sessions.filter(s => s.subject === filter) : sessions;
  return (
    <View style={s.c}>
      <FlatList horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fr}
        data={[null,...SUBJECTS]} keyExtractor={i=>i??'all'}
        renderItem={({item}) => (
          <Pressable style={[s.fc, filter===item && s.fa]} onPress={()=>setFilter(item)}>
            <Text style={[s.ft, filter===item && s.fta]}>{item ? t('parent.sessions.filter'+item.charAt(0).toUpperCase()+item.slice(1)) : t('parent.sessions.filterAll')}</Text>
          </Pressable>
        )} />
      <FlatList data={filtered} keyExtractor={i=>i.id}
        renderItem={({item}) => (
          <Pressable style={s.card} onPress={()=>setExpandedId(expandedId===item.id?null:item.id)}>
            <View style={s.h}><Text style={s.e}>{SE[item.subject]??'📚'}</Text><View style={s.meta}><Text style={s.subj}>{t('kidHome.subjects.'+item.subject,item.subject) as string}</Text><Text style={s.date}>{fd(item.startedAt)}</Text></View>
              <View style={s.st}><Text style={s.dur}>{dur(item.startedAt,item.endedAt)}</Text><Text style={s.q}>{item.questionsAttempted} {t('parent.sessions.questions')}</Text></View></View>
            {expandedId===item.id && <View style={s.ex}>{item.aiSummary&&<><Text style={s.dl}>{t('parent.sessions.aiHelp')}</Text><Text style={s.dt}>{item.aiSummary}</Text></>}</View>}
          </Pressable>
        )}
        contentContainerStyle={s.lc} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={s.emp}><Text style={s.ei}>{'📝'}</Text><Text style={s.et}>{t('parent.sessions.empty')}</Text></View>} />
    </View>
  );
}
const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#F8F9FA'}, fr:{paddingHorizontal:16,paddingVertical:12,gap:8},
  fc:{paddingVertical:8,paddingHorizontal:16,borderRadius:20,backgroundColor:'#F3F4F6',marginRight:8},
  fa:{backgroundColor:'#2563EB'}, ft:{fontSize:14,fontWeight:'600',color:'#6B7280'}, fta:{color:'#FFF'},
  lc:{padding:16,paddingTop:0,gap:10},
  card:{backgroundColor:'#FFF',padding:14,borderRadius:12,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.06,shadowRadius:3,elevation:1},
  h:{flexDirection:'row',alignItems:'center',gap:12}, e:{fontSize:28,width:40,textAlign:'center'},
  meta:{flex:1}, subj:{fontSize:16,fontWeight:'600',color:'#1A1A1A',marginBottom:2}, date:{fontSize:13,color:'#9CA3AF'},
  st:{alignItems:'flex-end'}, dur:{fontSize:14,fontWeight:'600',color:'#374151'}, q:{fontSize:12,color:'#9CA3AF'},
  ex:{marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#F3F4F6'},
  dl:{fontSize:13,fontWeight:'600',color:'#6B7280',marginBottom:4,textTransform:'uppercase',letterSpacing:0.5},
  dt:{fontSize:14,lineHeight:20,color:'#374151'},
  emp:{alignItems:'center',paddingVertical:48,gap:8}, ei:{fontSize:36}, et:{fontSize:15,color:'#9CA3AF',textAlign:'center'},
})
