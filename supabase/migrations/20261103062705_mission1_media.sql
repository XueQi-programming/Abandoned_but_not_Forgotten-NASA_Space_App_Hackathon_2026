INSERT INTO public.media (
    mission_id,
    section_id,
    equipment_id,
    media_type,
    media_url,
    caption,
    source_url,
    display_order
)
SELECT
    m.mission_id,
    s.section_id,
    e.equipment_id,
    'image',
    'URL_IMAGE',
    1
FROM public.missions m
JOIN public.chapters ch
    ON ch.mission_id = m.mission_id
JOIN public.sections s
    ON s.chapter_id = ch.chapter_id
JOIN public.equipment e
    ON e.mission_id = m.mission_id
WHERE
    m.name = 'Apollo 11 — Lunar Module and Scientific Equipment'
    AND ch.title = 'The Last Transmission'
    AND s.title = 'What Was Left Behind?'
    AND e.name = 'Eagle Lunar Module Descent Stage';
    