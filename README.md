# WatchRoulette 🎬

A cinematic movie-night companion that pulls your public Letterboxd watchlist and randomly chooses what to watch next.

Stop scrolling. Start watching.

## Features

* Scrapes public Letterboxd watchlists
* Enriches movies using TMDB + OMDb
* Beautiful cinematic UI
* Random movie picker with dramatic reveal
* IMDb + TMDB ratings
* Mobile-first responsive design
* Smooth animations with Framer Motion
* Fullscreen immersive loading experience

## Tech Stack

* Next.js 15 / App Router
* TypeScript
* TailwindCSS
* Framer Motion
* Cheerio
* TMDB API
* OMDb API

## How It Works

1. User enters a public Letterboxd username
2. The app scrapes the user's watchlist
3. Each movie is enriched with:

   * posters
   * backdrops
   * ratings
   * genres
   * runtime
   * overview
4. A random movie is selected with a cinematic reveal



## APIs Used

* TMDB
* OMDb
* Public Letterboxd pages

## Important Notes

* Only public Letterboxd watchlists work
* Posters and metadata come from TMDB and OMDb (might be wrong)
* Letterboxd is only used for watchlist discovery (their API is private)

## Future Ideas

 [] Share movie picks
 [] Friend/group movie roulette
 [] Streaming provider integration
 [] AI-powered recommendations
 [] Watch history
 [] Mood filters

## Disclaimer

This project is not affiliated with or endorsed by Letterboxd.
