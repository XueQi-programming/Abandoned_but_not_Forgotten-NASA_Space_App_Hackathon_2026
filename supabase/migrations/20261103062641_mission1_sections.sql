INSERT INTO public.sections (
    chapter_id,
    section_number,
    title,
    content,
    content_type
)
SELECT
    ch.chapter_id,
    s.section_number,
    s.title,
    s.content,
    s.content_type
FROM public.chapters ch
JOIN public.missions m
    ON m.mission_id = ch.mission_id
JOIN (
    VALUES
        -- Chapter 1: The Mission Begins
        (
            1, 1.1,
            'Why Reach the Moon?',
            'Apollo 11 was part of NASA''s Apollo programme. Its primary objective was to land humans on the Moon and return them safely to Earth. The mission also aimed to collect lunar samples, conduct observations, and deploy scientific instruments.',
            'paragraph'
        ),
        (
            1, 1.2,
            'The Technology Behind the Mission',
            'NASA developed spacecraft and systems capable of transporting astronauts between Earth and the Moon. The Apollo spacecraft consisted of the Command Module, Service Module, and Lunar Module. Each component had a different role in supporting the mission.',
            'paragraph'
        ),

        -- Chapter 2: The Journey Beyond Earth
        (
            2, 2.1,
            'The Historic Launch',
            'Apollo 11 launched from Kennedy Space Center on 16 July 1969 aboard the Saturn V rocket. The launch began the journey that would take the astronauts from Earth to the Moon.',
            'paragraph'
        ),
        (
            2, 2.2,
            'The Journey to the Moon',
            'After leaving Earth, the Apollo spacecraft travelled toward the Moon. The Command and Service Modules supported the journey, while the Lunar Module Eagle was used for the lunar landing.',
            'paragraph'
        ),
        (
            2, 2.3,
            'The First Lunar Landing',
            'On 20 July 1969, Neil Armstrong and Buzz Aldrin landed on the lunar surface using the Lunar Module Eagle. Michael Collins remained in lunar orbit aboard the Command Module.',
            'paragraph'
        ),
        (
            2, 2.4,
            'Returning Home',
            'After completing their lunar activities, Armstrong and Aldrin returned to the Command Module. The astronauts later travelled back to Earth and splashed down on 24 July 1969.',
            'paragraph'
        ),

        -- Chapter 3: Secrets of the Unknown
        (
            3, 3.1,
            'Exploring the Lunar Surface',
            'Neil Armstrong and Buzz Aldrin explored the lunar surface, collected rocks and soil, took photographs, and conducted observations. These activities provided valuable material and information for scientific research.',
            'paragraph'
        ),
        (
            3, 3.2,
            'Listening to the Moon',
            'The Apollo 11 seismometer was deployed to detect vibrations and movements on the Moon, including moonquakes. Its measurements helped scientists investigate the Moon''s internal structure. The instrument stopped operating after a short period because of technical problems.',
            'paragraph'
        ),
        (
            3, 3.3,
            'Measuring the Distance to the Moon',
            'The laser-ranging reflector was placed on the lunar surface to reflect laser pulses sent from Earth. Scientists measure the time taken for the light to return to calculate the Earth–Moon distance accurately. The reflector continues to support scientific measurements.',
            'paragraph'
        ),

        -- Chapter 4: Against the Odds
        (
            4, 4.1,
            'Surviving the Lunar Environment',
            'The Moon has no breathable atmosphere and experiences extreme temperature conditions. Apollo spacecraft and equipment had to be designed to operate in this challenging environment.',
            'paragraph'
        ),
        (
            4, 4.2,
            'The Challenge of Landing',
            'Landing a spacecraft on the Moon required careful navigation, guidance, and control. The Lunar Module had to descend safely onto the lunar surface while carrying the astronauts.',
            'paragraph'
        ),
        (
            4, 4.3,
            'Keeping Scientific Equipment Working',
            'Scientific instruments deployed on the Moon had to operate without direct human supervision after the astronauts departed. The Apollo 11 seismometer experienced technical problems and stopped operating after a relatively short period.',
            'paragraph'
        ),

        -- Chapter 5: The Last Transmission
        (
            5, 5.1,
            'The Final Stage of the Mission',
            'After completing their activities on the lunar surface, Armstrong and Aldrin left the Moon in the Lunar Module ascent stage and reunited with Michael Collins in the Command Module.',
            'paragraph'
        ),
        (
            5, 5.2,
            'What Was Left Behind?',
            'The Eagle Lunar Module descent stage and scientific instruments remained on the Moon. The descent stage was the landing component of the Lunar Module, not an independent robot that continued exploring.',
            'paragraph'
        ),
        (
            5, 5.3,
            'Where Is the Equipment Today?',
            'The Apollo 11 descent stage remains at the lunar landing site. The seismometer is no longer operational, while the laser-ranging reflector remains usable for scientific measurements.',
            'paragraph'
        ),

        -- Chapter 6: Beyond the Mission
        (
            6, 6.1,
            'Bringing the Moon Back to Earth',
            'Apollo 11 returned lunar rocks and soil to Earth. Scientists could study these samples in laboratories to investigate the Moon''s composition and geological history.',
            'paragraph'
        ),
        (
            6, 6.2,
            'A Lasting Scientific Contribution',
            'The laser-ranging reflector continues to support precise measurements of the distance between Earth and the Moon, demonstrating how equipment deployed during a historic mission can remain scientifically useful.',
            'paragraph'
        ),
        (
            6, 6.3,
            'A Milestone in Human Exploration',
            'Apollo 11 marked the first time humans walked on the Moon. Its achievements demonstrated the capabilities of human spaceflight and influenced subsequent lunar exploration efforts.',
            'paragraph'
        )
) AS s(
    chapter_number,
    section_number,
    title,
    content,
    content_type
)
    ON s.chapter_number = ch.chapter_number
WHERE m.name = 'Apollo 11 — Lunar Module and Scientific Equipment';
