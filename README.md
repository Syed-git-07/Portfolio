# Syed Sufyan M — Personal Portfolio

A premium, fully responsive personal portfolio website built with **HTML5**, **CSS3**, and **Vanilla JavaScript** — no frameworks needed.

**Live Preview:** Deploy to [Vercel](https://vercel.com) for free in one click.

---

## ✨ Features

- 🌙 **Dark / Light Mode** — smooth theme switching with `localStorage` persistence
- 🧭 **Floating Capsule Navbar** — glassmorphic pill-style navigation with active glow indicator
- 📋 **More Dropdown** — hover/click dropdown for Skills, Certifications, and Achievements sections
- 📱 **Fully Responsive** — mobile hamburger menu with drawer, fluid grid layouts
- 🎯 **Scroll Spy** — active nav link auto-highlights as you scroll through sections
- 🎨 **Premium Animations** — glow blobs, pulse badges, scroll indicator, card hover effects
- ♿ **Accessible** — proper ARIA labels, semantic HTML5, keyboard-navigable

---

## 📁 Project Structure

```
Portfolio/
├── index.html              # Main single-page HTML
├── vercel.json             # Vercel deployment config
├── assets/
│   └── profile.png         # Profile photo (replace with your own)
├── styles/
│   ├── base.css            # CSS variables, design system, section styles
│   └── navbar.css          # Floating navbar, dropdown, mobile menu
└── scripts/
    └── js-navbar.js        # Navigation indicator, scroll spy, theme toggle
```

---

## 🚀 Deployment on Vercel

1. Push this repository to **GitHub**
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**
3. Import your GitHub repository
4. Vercel auto-detects a static site — click **Deploy**

That's it! Your portfolio is live in under a minute. 🎉

---

## 🔧 Customization

### Profile Photo
Replace `assets/profile.png` with your actual photo. Ideal dimensions: **640×760px** or portrait aspect ratio.

### Social Links
Update the GitHub, LinkedIn, and LeetCode URLs in `index.html`:
```html
<a href="https://github.com/YOUR_USERNAME" ...>GitHub</a>
<a href="https://linkedin.com/in/YOUR_PROFILE" ...>LinkedIn</a>
<a href="https://leetcode.com/YOUR_USERNAME" ...>LeetCode</a>
```

### Projects
Add or edit project cards in the `#projects` section of `index.html`.

### Colors
All theme colors are CSS custom properties in `styles/base.css`:
```css
:root, [data-theme="dark"] {
  --highlight: #a855f7;  /* Change this to any accent color */
}
```

---

## 📄 License

MIT — feel free to fork, modify, and use.
