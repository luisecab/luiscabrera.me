# Portfolio Website Build Prompt

Create a modern, elegant single-page portfolio website for Luis Cabrera. The design should feel premium, creative, and distinctly NOT like an AI-generated template.

## Design Requirements

### Visual Style
- **Color palette:** Light neutrals — off-white (#f8f7f4), warm grays (#e8e6e3, #d4d2cf), subtle accent (#2d2d2d for text)
- **Typography:** Use Inter or similar clean sans-serif from Google Fonts
- **Section headers:** Make them BOLD and PROMINENT — not small muted text. Use larger font size (24-32px), heavier weight (600-700), and darker color. Section headers should command attention, not whisper.
- **Aesthetic:** Liquid glass / glassmorphism for cards, organic flowing lines in background
- **Vibe:** Minimal, sophisticated, creative-personal — think Linear or Vercel design language but warmer

### Key Visual Elements

1. **Animated Flowing Lines Background (CRITICAL)**
   - Create SVG curved paths that flow organically across the entire page
   - Lines should be thin (1-2px stroke), light gray (#d4d2cf or #e0e0e0)
   - Use CSS keyframe animations to slowly animate the paths using stroke-dashoffset
   - Lines should curve and flow like the reference: https://landonorris.com
   - The effect creates continuous flowing movement along the curves
   - Implementation approach:
     ```html
     <svg class="background-lines" viewBox="0 0 1920 1080" preserveAspectRatio="none">
       <path class="flow-line" d="M-100,200 Q400,100 600,300 T1200,250 T1900,400" />
       <path class="flow-line" d="M-100,500 Q300,400 700,600 T1400,450 T2000,600" />
       <!-- More organic curved paths -->
     </svg>
     ```
     ```css
     .flow-line {
       fill: none;
       stroke: #d4d2cf;
       stroke-width: 1.5;
       stroke-dasharray: 1000;
       stroke-dashoffset: 1000;
       animation: flowLine 20s linear infinite;
     }
     @keyframes flowLine {
       to { stroke-dashoffset: 0; }
     }
     ```
   - Create 5-8 flowing lines at different positions
   - Stagger animation delays for organic feel
   - Lines should span the full viewport and flow continuously
   - This is THE signature visual element — get it right

2. **Glassmorphism Cards**
   - Use `backdrop-filter: blur(20px)` with semi-transparent white backgrounds
   - Subtle border (1px solid rgba(255,255,255,0.2))
   - Soft shadow for depth

3. **Console Easter Egg**
   - On page load, print ASCII art of "LUIS CABRERA" to the browser console
   - Style it with console CSS (color, font-size)
   - Make it creative and memorable

## Structure & Content

### Hero Section
```
LUIS CABRERA
Product & Tech

[Subtle animated signature or minimal graphic element]
```

### About (Glass Card)
Brief intro — Technical Product Manager with background in logistics, e-commerce, and data. Building products that solve real problems. Currently at P&G leading CRM & messaging tech. Side projects: FotoSeller, traX.

### Projects Section

**FotoSeller** (MVP)
- Solving pain points for small and medium marketplace sellers
- AI-powered product photography tool
- Tech: React, TypeScript, Supabase, Gemini AI
- [Link to GitHub when ready]

**traX** (Alpha)  
- Health tracking and longevity
- [Brief description]

### Skills Grid (Use subtle glass cards or pills)

**Product & Growth**
- Road-mapping, OKRs, Braze, Segment, CRM Strategy, User Engagement

**Data, Cloud & Analytics**
- SQL, BigQuery, GCP, REST APIs, PowerBI, Data Engineering

**Ways of Working**
- Scrum/Kanban, Jira, Agile/Waterfall, Cross-functional Leadership, Stakeholder Management

### Professional Experience (Timeline or Cards)

**Procter & Gamble** — Technical Product Manager
Warsaw, Poland | Jan 2022 - Present
- Tech Lead for Messaging X Braze - Pampers Data Platform
- Leading CRM Tech Ops, CDP integrations, migrations, efficiency gains
- CEO Award 2023 (Top 2% of 100K+ employees)
- 'Best Manager' honors for fostering record engagement

**Foxtrot Systems (Descartes)** — Account Project Manager
CDMX, Mexico | May 2021 - Jan 2022
- Rolled out AI-driven logistics SaaS in 12 countries
- Built Tableau KPIs portal that lifted adoption from 69% to 80%

**Mercado Libre** — Product - Shipping
CDMX, Mexico | Apr 2020 - May 2021
- Headed quality analytics, training, process audits & control-tower team
- +0.40pp in delivery success rate

**FREENOW (Beat)** — Operations Specialist
CDMX, Mexico | May 2019 - Apr 2020
- Managed rental fleet operations
- Liability insurance roll-out

### Featured Achievements (Optional highlight cards)

- **Pampers CRM Tech Lead:** Reduced API data consumption by 1200 basis points
- **Media Optimization:** Designed predictive scoring models optimizing marketing spend
- **Global Product Launch:** Delivered Braun launches across 3 continents on time

### Education

**Warsaw School of Economics**
MSc Big Data, Advanced Analytics | 2023-2025 | GPA 4.0

**National Polytechnic Institute**
BS Industrial Engineering | 2013-2018 | GPA 4.4

### Contact/Footer
- GitHub: https://github.com/luisecab
- LinkedIn: https://www.linkedin.com/in/luisecab/

## Technical Requirements

### Stack
- Pure HTML, CSS, and vanilla JavaScript (no frameworks needed for a portfolio)
- Single `index.html` file with embedded CSS and JS for simplicity
- OR separate files: `index.html`, `styles.css`, `main.js`

### Must Include
1. Responsive design (mobile-first)
2. Smooth scroll behavior
3. Intersection Observer for fade-in animations on scroll
4. Console ASCII art easter egg on load
5. Animated SVG blobs in background
6. Glass-morphism cards with backdrop-filter
7. Accessible (proper semantic HTML, alt texts, ARIA where needed)
8. Fast loading (no heavy dependencies)

### Console Easter Egg Code Example
```javascript
console.log(`
%c
██╗     ██╗   ██╗██╗███████╗
██║     ██║   ██║██║██╔════╝
██║     ██║   ██║██║███████╗
██║     ██║   ██║██║╚════██║
███████╗╚██████╔╝██║███████║
╚══════╝ ╚═════╝ ╚═╝╚══════╝

 ██████╗ █████╗ ██████╗ ██████╗ ███████╗██████╗  █████╗ 
██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗
██║     ███████║██████╔╝██████╔╝█████╗  ██████╔╝███████║
██║     ██╔══██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗██╔══██║
╚██████╗██║  ██║██████╔╝██║  ██║███████╗██║  ██║██║  ██║
 ╚═════╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
`, 'color: #2d2d2d; font-family: monospace;');

console.log('%c👋 Hey! Curious about the code? Check out the repo.', 'color: #666; font-size: 14px;');
```

### File Structure to Create
```
portfolio/
├── index.html
├── styles.css
├── main.js
└── README.md
```

## What NOT to Do
- No generic hero images or stock photos
- No excessive animations or parallax effects
- No bright/saturated accent colors
- No cookie-cutter template layouts
- No bullet point lists in visible content — use cards, grids, or prose
- No "Welcome to my portfolio" generic text
- **No tiny, muted section headers** — section titles like "PROJECTS", "SKILLS", "EXPERIENCE" should be bold and prominent, not small gray text

## Inspiration References
- **landonorris.com** — THE primary reference for the animated flowing lines background
- Linear.app design language
- Vercel.com aesthetic
- Stripe.com card designs

---

Build the complete website with all sections. Make it production-ready.
