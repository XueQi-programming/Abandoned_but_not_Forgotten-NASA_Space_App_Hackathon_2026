import { supabaseClient } from '../config/supabaseClient.js';

export async function getMissions() {
  const { data, error } = await supabaseClient
    .from('missions')
    .select('mission_id,name,agency,destination,mission_type,launch_date,landing_date,end_date,final_location,main_purpose,cover_image')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMissionDetails(missionId) {
  const [missionRes, chaptersRes, equipmentRes, mediaRes, sourcesRes] = await Promise.all([
    supabaseClient.from('missions').select('*').eq('mission_id', missionId).single(),
    supabaseClient.from('chapters').select('*').eq('mission_id', missionId).order('chapter_number'),
    supabaseClient.from('equipment').select('*').eq('mission_id', missionId).order('name'),
    supabaseClient.from('media').select('*').eq('mission_id', missionId).order('display_order'),
    supabaseClient.from('sources').select('*').eq('mission_id', missionId).order('title')
  ]);

  for (const result of [missionRes, chaptersRes, equipmentRes, mediaRes, sourcesRes]) {
    if (result.error) throw result.error;
  }

  const chapters = chaptersRes.data ?? [];
  const chapterIds = chapters.map(chapter => chapter.chapter_id);
  let sections = [];

  if (chapterIds.length) {
    const { data, error } = await supabaseClient
      .from('sections')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('section_number');
    if (error) throw error;
    sections = data ?? [];
  }

  return {
    mission: missionRes.data,
    chapters,
    sections,
    equipment: equipmentRes.data ?? [],
    media: mediaRes.data ?? [],
    sources: sourcesRes.data ?? []
  };
}
