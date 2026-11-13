export function filterMissions(missions, query, category) {
  const term = query.trim().toLowerCase();
  return missions.filter(mission => {
    const matchesText = !term || [
      mission.name, mission.destination, mission.mission_type,
      mission.agency, mission.main_purpose
    ].some(value => String(value ?? '').toLowerCase().includes(term));
    const matchesCategory = !category || category === 'All' ||
      (mission.destination || mission.mission_type || 'Other') === category;
    return matchesText && matchesCategory;
  });
}

export function getCategories(missions) {
  return ['All', ...new Set(missions.map(m => m.destination || m.mission_type || 'Other').filter(Boolean))];
}
