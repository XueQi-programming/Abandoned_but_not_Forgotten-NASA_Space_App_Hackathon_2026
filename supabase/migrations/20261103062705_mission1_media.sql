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
    'https://myunwatuwabhnrujcunc.supabase.co/storage/v1/object/sign/mission_images/mission1_apollo11/mission1_apollo11-1.png?token=eyJraWQiOiIyYmVhZjAxZC1kMDBkLTQ3NTgtOGZlNi1mNmUwODlhNzBlYmEiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJtaXNzaW9uX2ltYWdlcy9taXNzaW9uMV9hcG9sbG8xMS9taXNzaW9uMV9hcG9sbG8xMS0xLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTM2ODcwNzEsImV4cCI6MTc5ODg3MTA3MX0.Us7E8uOEMjAHr4Ydnmf8LgEaTZAB1-765jhIvCfk-7kSJikvj98IIn3xCxPg8LRdCkJSGKoesSo4Di4_aqsrmQ',
    'The Eagle Lunar Module descent stage on the Moon',
    'https://www.nasa.gov/mission/apollo-11/',
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
    