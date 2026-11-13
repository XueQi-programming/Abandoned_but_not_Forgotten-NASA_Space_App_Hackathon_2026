INSERT INTO public.sources (
    mission_id,
    section_id,
    equipment_id,
    title,
    publisher,
    source_url,
    publication_date,
    accessed_date
)
SELECT
    m.mission_id,
    NULL,
    NULL,
    'Apollo 11',
    'NASA',
    'https://www.nasa.gov/mission/apollo-11/',
    NULL,
    CURRENT_DATE
FROM public.missions m
WHERE m.name = 'Apollo 11 — Lunar Module and Scientific Equipment';
