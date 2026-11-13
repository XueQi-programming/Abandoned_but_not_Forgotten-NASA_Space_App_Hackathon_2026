# Abandoned_but_not_Forgotten-NASA_Space_App_Hackathon_2026
# The Spacebound Library
A vanilla HTML/CSS/JavaScript + Vite + Supabase digital space library.

Description:
Space missions leave behind equipment on the Moon, Mars, and elsewhere. People may not know what these machines accomplished or what happened to them.
Building an interactive website with mission timelines, rover stories, images, maps, and explanations of scientific discoveries.

## 1. Run locally
1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env`.
4. Fill in your Supabase Project URL and publishable/anon key.
5. Run `npm run dev` and open the local URL shown by Vite.

## 2. Supabase tables used
This project matches the schema in the supplied database diagram:
- `missions`: mission metadata and `cover_image`
- `chapters`: chapter list, filtered by `mission_id`
- `sections`: section content, filtered by `chapter_id`
- `equipment`: mission equipment
- `media`: image/media records
- `sources`: references
