-- Migration: Mission 1 - Apollo 11
-- Table: missions

INSERT INTO public.missions (
    name,
    agency,
    destination,
    mission_type,
    launch_date,
    landing_date,
    end_date,
    last_communication,
    final_location,
    main_purpose,
    cover_image
)

VALUES (
    'Apollo 11 — Lunar Module and Scientific Equipment',
    'NASA',
    'Moon',
    'Crewed',
    '1969-07-16',
    '1969-07-20',
    '1969-07-24',
    NULL,
    'Lunar surface, Moon',
    'To land humans on the Moon and study its surface. The mission used the Lunar Module Eagle and deployed scientific instruments for lunar research.',
    NULL
);
