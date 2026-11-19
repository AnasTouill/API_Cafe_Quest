# API Café Quest

A small browser game that teaches **REST APIs** and **GraphQL** to engineering students.
It's set in a café in Sidi Bou Said, run by Gattous, a server cat in a red chechia.
Students serve the "orders" that client apps send, and they learn how apps talk to servers along the way.

## Play

- **Easiest:** double-click `index.html`. There's nothing to install and no build step.
- **With a local server** (optional):

  ```bash
  python -m http.server 8000
  ```

  Then open <http://localhost:8000>.
- **Online for a class:** push the repo to GitHub and turn on **Settings → Pages**. Students only need the link.

## Levels

| # | Level | Topic | What students do |
|---|-------|-------|------------------|
| 1 | The 5 verbs | REST · HTTP verbs | Choose GET, POST, PUT, PATCH or DELETE for a request |
| 2 | Endpoints | REST · URLs | Pick the most RESTful endpoint (`GET /students`, not `/getAllStudents`) |
| 3 | Status codes | REST · responses | Predict the server's answer: 200, 201, 204, 301, 400, 401, 403, 404, 429, 500 |
| 4 | Query or mutation? | GraphQL · operations | Sort operations; each answer shows its REST equivalent |
| 5 | Kaskrout query | GraphQL · fields | Build a query with exactly the fields a screen needs (over- and under-fetching) |
| 6 | REST or GraphQL? | Final boss | Sort facts into the right style |

Each level starts with a key-points card. Students have 3 hearts per level, and the hearts they keep become their stars.
There's also a cheat sheet and an "API Master" certificate that students can sign with their name.

## Controls

- Mouse or touch for everything.
- Keys `1`–`9` pick an answer, and `Enter` goes to the next order.
- The top bar has sound on/off, a day/night theme and the cheat sheet.

## Project structure

```
index.html   page shell (loads the fonts, style.css and game.js)
style.css    all styles, with light and dark themes as CSS variables
game.js      game logic, question banks, SVG drawings and screens
```

The game uses plain HTML, CSS and JavaScript, with no libraries or dependencies.
The fonts (Baloo 2, Nunito and JetBrains Mono) load from Google Fonts. Offline, the game falls back to system fonts.
Progress, the sound setting, the theme and the certificate name are saved in the browser's `localStorage`.

## Tunisian words in the game

| Word | Meaning |
|------|---------|
| 3aslema | Hello |
| Mrigel! | Great! |
| Bravo 3lik! | Well done! |
| Ya3tik sa77a! | Well done / thank you |
| Behi barcha! | Very good! |
| Ma3lich | Never mind |
| Kaskrout | Tunisian sandwich |
| Gattous | Cat |

## Sources

- HTTP semantics, verbs and status codes: RFC 9110; PATCH: RFC 5789
- GraphQL operations: the GraphQL specification (spec.graphql.org)
- "86% of developers use REST": Postman, *State of the API Report 2023*
