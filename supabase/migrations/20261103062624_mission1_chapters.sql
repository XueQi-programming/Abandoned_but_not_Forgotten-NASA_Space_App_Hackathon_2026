INSERT INTO public.chapters (
    mission_id,
    chapter_number,
    title,
    description
)
SELECT
    m.id,
    c.chapter_number,
    c.title,
    c.description
FROM public.missions m
CROSS JOIN (
    VALUES
        (
            1,
            'The Mission Begins',
            'Discover why NASA set out to land humans on the Moon, the original objectives of Apollo 11, and the technology developed to make the mission possible.'
        ),
        (
            2,
            'The Journey Beyond Earth',
            'Follow Apollo 11 from its historic launch on Earth to its journey through space, lunar landing, and return home.'
        ),
        (
            3,
            'Secrets of the Unknown',
            'Explore the scientific experiments, lunar samples, photographs, and discoveries that helped scientists understand the Moon.'
        ),
        (
            4,
            'Against the Odds',
            'Discover the challenges of operating spacecraft in space, navigating the lunar environment, and safely completing the lunar landing.'
        ),
        (
            5,
            'The Last Transmission',
            'Uncover the final stages of Apollo 11, the astronauts'' departure from the lunar surface, and the equipment left behind on the Moon.'
        ),
        (
            6,
            'Beyond the Mission',
            'Explore Apollo 11''s scientific contributions, technological achievements, and lasting influence on future space exploration.'
        )
) AS c(chapter_number, title, description)
WHERE m.name = 'Apollo 11 — Lunar Module and Scientific Equipment';
