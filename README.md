# Sulyap — CALABARZON Virtual Tour and Cultural Mapping App

An educational virtual tour, multiple-choice quiz, and cultural mapping web application (PWA) for **Region IV-A (Cavite, Laguna, Batangas, Rizal, Quezon)** built with **TanStack Start, React, Tailwind CSS v4, Leaflet, and Lovable Cloud (Supabase)**.

Includes **Phase 1** (CRUD, destination info, search and category/province filter, navigation, database) and **Phase 2** (3-stop virtual tour, multiple-choice quiz with automatic scoring & explanations, and Pasaporte stamp & progress tracking).

---

## Design System (Sulyap)

- **Colors:** Flag Blue (`#2B59C3`), Katipunan Red (`#D2372B`), Araw Gold (`#F6B21A`), Palay Green (`#2E8B4F`) on Abaca Paper (`#FAF8F1`) with Indigo Ink (`#1B2247`).
  - **Pamana / Historical Shrines:** Red (`#D2372B`)
  - **Simbahan / Religious Landmarks:** Blue (`#2B59C3`)
  - **Museo / Museums:** Gold (`#F6B21A`, deep `#8F6200`, ink text)
  - **Kalikasan / Natural Heritage:** Green (`#2E8B4F`, deep `#237040`)
- **Typography:** `Alfa Slab One` for titles and numbers; `Figtree` (`500`, `700`) for body copy and controls.
- **Signature Elements:**
  - `Pop` card (2px ink border, hard offset shadow, tactile press-down interaction)
  - `Banig` woven-diamond SVG pattern covers (unique per destination seed)
  - `Mark` four-diamond emblem
  - `Ticket` perforated stub list cards with rotated province badge
  - `Stamp` (`selyo`) circular passport stamp with tour completion animation

---

## Requirement Map

| Requirement                | Implementation                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CRUD**                   | [destination-form.tsx](src/components/destination-form.tsx) (add/edit with validation), [destinations.$slug.tsx](src/routes/destinations.$slug.tsx) (view/edit/delete), [manage.tsx](src/routes/manage.tsx) |
| **Destination Info**       | Name, description, history (`Kasaysayan`), cultural significance (`Kahalagahan`), verified sources (`Mga Sanggunian`), address, province, category, coordinates, and images                                 |
| **Search & Filter**        | [destinations.index.tsx](src/routes/destinations.index.tsx) live search + category and province `Chip` filters                                                                                              |
| **Navigation**             | [site-nav.tsx](src/components/site-nav.tsx) (`Tahanan`, `Destinasyon`, `Pasaporte`, `Mapa`, `Pamahalaan`)                                                                                                   |
| **Cultural Map**           | [cultural-map.tsx](src/components/cultural-map.tsx) interactive Leaflet map with category-colored diamond pins + "Open in Maps" link                                                                        |
| **Virtual Tour**           | [sulyap-tour-quiz.tsx](src/components/sulyap-tour-quiz.tsx) (`SulyapTour`: 3 stops — `1. Larawan`, `2. Kasaysayan`, `3. Kahalagahan` + `Mga Sanggunian`)                                                    |
| **Quiz & Auto Score**      | [sulyap-tour-quiz.tsx](src/components/sulyap-tour-quiz.tsx) (`SulyapQuiz`: 4-option multiple-choice questions, immediate feedback, historical explanation, auto-saved best/attempts/last score)             |
| **Progress (`Pasaporte`)** | [sulyap-passport.tsx](src/components/sulyap-passport.tsx) (earned stamps grid, places finished, average best score, total quizzes taken, per-place score bars)                                              |

---

## Setup & Commands

```bash
npm install
npm run dev       # Start local development server
npm run format    # Format with Prettier
npm run lint      # Run ESLint check
npm test          # Run Vitest unit & routing tests
npm run build     # Production SSR + client bundle check
```

---

## Demo Script

1. **Tahanan (Home):** View overall stamp progress on the hero card, browse the 5 CALABARZON province tiles (`Mga Lalawigan`), or tap `Susunod na hintuan`.
2. **Destinasyon (Browse):** Filter by category chip (`Pamana`, `Simbahan`, `Museo`, `Kalikasan`) or province chip, or search by town/keyword.
3. **Ticket & Detail:** Open a destination ticket to inspect its cover, address, province, category, coordinates, description, and `Mga Sanggunian`, or click **Open in Maps**.
4. **Virtual Tour (3 Stops):** Click **Start the virtual tour** (`Simulan ang paglilibot`), step through `1. Larawan`, `2. Kasaysayan`, and `3. Kahalagahan`, and click **Finish the tour** to earn your animated `Selyo` stamp.
5. **Quiz (`Pagsusulit`):** Click **Take the quiz**, answer the 4 multiple-choice questions with instant feedback and explanations, and view your `Resulta`.
6. **Pasaporte:** Open **Pasaporte** from the navigation bar to see your earned stamps (`Mga Selyo`), average best score, and quiz score bars (`Mga Marka`).
7. **CRUD (Add / Edit / Delete):** Click **Add place** (or **Edit** / **Delete** on any place) to test full persistence and cascade cleanup.
