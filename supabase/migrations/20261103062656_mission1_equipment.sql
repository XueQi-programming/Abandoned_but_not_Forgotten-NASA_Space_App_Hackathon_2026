INSERT INTO public.equipment (
    mission_id,
    name,
    equipment_type,
    purpose,
    description,
    location,
    operational_status,
    date_deployed,
    image_url
)
SELECT
    m.mission_id,
    e.name,
    e.equipment_type,
    e.purpose,
    e.description,
    e.location,
    e.operational_status,
    e.date_deployed,
    NULL
FROM public.missions m
CROSS JOIN (
    VALUES
        (
            'Eagle Lunar Module Descent Stage',
            'Spacecraft Component',
            'To provide the landing stage of the Lunar Module during its descent to the lunar surface.',
            'The descent stage was part of the Lunar Module Eagle. It enabled the astronauts to land on the Moon and remained on the lunar surface after the ascent stage departed.',
            'Apollo 11 landing site, Moon',
            'Remains on the lunar surface',
            NULL::DATE
        ),
        (
            'Apollo 11 Seismometer',
            'Scientific Instrument',
            'To detect lunar vibrations and movements, including moonquakes.',
            'The seismometer was deployed by the astronauts to measure movements and vibrations on the lunar surface. Its measurements helped scientists investigate the Moon''s internal structure. It stopped operating after a short period because of technical problems.',
            'Apollo 11 landing site, Moon',
            'No longer operational',
            NULL::DATE
        ),
        (
            'Laser-ranging Reflector',
            'Scientific Instrument',
            'To reflect laser pulses sent from Earth for precise Earth–Moon distance measurements.',
            'The reflector returns laser pulses toward their source on Earth. Scientists measure the travel time of the light to calculate the distance between Earth and the Moon. It remains usable for scientific measurements.',
            'Apollo 11 landing site, Moon',
            'Still usable for scientific measurements',
            NULL::DATE
        )
) AS e(
    name,
    equipment_type,
    purpose,
    description,
    location,
    operational_status,
    date_deployed
)
WHERE m.name = 'Apollo 11 — Lunar Module and Scientific Equipment';
