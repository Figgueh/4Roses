# 🏡 4 Roses Rental Property Website — Alvor, Portugal
[![Website](https://img.shields.io/badge/Website-Live-brightgreen?logo=cloudflare)](https://4roses.fignet.ca/)
[![Staging](https://img.shields.io/badge/Staging-4roses.dev.fignet.ca-blue?logo=cloudflare)](https://staging.4rosesalvor.com)  
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Hosting-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render.com-46E3B7?logo=render&logoColor=white)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)
![LibreTranslate](https://img.shields.io/badge/Translation-LibreTranslate-0081CB?logo=docker&logoColor=white)
![OpenRouter](https://img.shields.io/badge/AI-OpenRouter%20API-6C63FF?logo=openai&logoColor=white)

## 📚 Table of Contents

- [🚀 Project Summary](#-project-summary)
- [✨ Features](#-features)
  - [📝 Article Generator](#-article-generator)
  - [🌐 Translation System](#-translation-system)
  - [🖼️ Photo Album Viewer](#-photo-album-viewer)
  - [🔑 Customer Login](#-customer-login)
  - [🛠️ Administration Dashboard](#-administration-dashboard)
- [🧩 Technologies & Services](#-technologies--services)
  - [🧭 Abstract](#-abstract)
  - [🌐 Domain](#-domain)
  - [🎨 Frontend](#-frontend)
  - [⚙️ Backend](#-backend)
  - [🗄️ Database](#-database)
  - [🤖 AI Integration](#-ai-integration)
- [🧠 Future Improvements](#-future-improvements)
- [👨‍💻 Developer Information](#-developer-information)


## 🚀 Project Summary

A full-stack website developed for **4 Roses Alvor Villa**, a rental property located in **Alvor, Portugal**.  
The project serves as a digital showcase for the property, featuring AI-generated articles, multilingual translation, dynamic content editing, and an administration dashboard — all built using **free-tier services** to minimize cost.

Despite budget constraints, it achieves:

- Real-time content generation
- Local translation services
- Secure authentication
- Dynamic content and photo management

---

## ✨ Features

### 📝 Article Generator
The **Article Generator** allows administrators to automatically create AI-written articles for activities in the area.

**Workflow:**
1. Admin selects an activity and provides a list of URLs for AI context.  
2. The backend scrapes the URLs using **Puppeteer**.  
3. Data is sent through the **OpenRouter API**, establishing a **Server-Sent Events (SSE)** stream to return content progressively.

**Error Handling:**
- Failed scrapes send an SSE notification back to the admin.  
- Success and progress updates are streamed in real-time.

**AI Response Handling:**
- Metadata such as title, image, and description are streamed first.  
- Each article section is streamed incrementally to the frontend.  
- Admins can edit or regenerate before saving.  
- Upon saving, the article is translated and published automatically.

---

### 🌐 Translation System
Translations are self-hosted to minimize costs and maximize flexibility.  
A **Docker container running LibreTranslate** handles translation requests locally.

**Workflow:**
- Once an article, activity, or amenity is generated, text is sent to LibreTranslate.  
- English is the default language; other languages are translated from it.

**Supported Languages:**
- 🇫🇷 `fr` — French  
- 🇪🇸 `es` — Spanish  
- 🇩🇪 `de` — German  
- 🇵🇹 `pt` — Portuguese  
- 🇳🇱 `nl` — Dutch  

**Editing Translations:**
- Admin edits in English are re-translated automatically.  
- Article translations are editable per language for granular control.

---

### 🖼️ Photo Album Viewer
Built using [React Photo Album](https://react-photo-album.com/) with custom admin functionality.

**Admin Controls:**
- 🖤 Set album display photo  
- ✏️ Edit image title and alt text  
- 🗑️ Select and delete images  
- 🖱️ Drag-and-drop to reorder photos  

**User Features:**
- Photos open in a [lightbox viewer](https://yet-another-react-lightbox.com/).  
- Future plans include a **visual house layout** for better context.

**Optimization:**
- [Imgix](https://www.imgix.com/) dynamically resizes images for viewport widths between `480–2560px`.

---

### 🔑 Customer Login
Authentication is powered by **Supabase Auth**.  
Currently, it serves administrative access only.

**Future Plans:**
- Enable **booking payments** directly through the website.  
- Add **comment sections** for users to review and discuss activities.

---

### 🛠️ Administration Dashboard
Centralized hub for managing all site content.

**Dashboard Tabs:**
1. **Interior Photos** — Upload and manage interior images.  
2. **Exterior Photos** — Upload and manage exterior images.  
3. **Amenities Editor** —  
   - Update amenity details, descriptions, and photos.  
   - Choose display size (small or large).  
   - Automatically translated upon edit.  
4. **Activity Editor** —  
   - Manage activities in the database.
   - Automatically translated upon edit.    
   - Prevent deletion of activities linked to articles.  
5. **Article Generator** —  
   - Access and control AI article creation.

---

## 🧩 Technologies & Services

### 🧭 Abstract
The website was built as **cost-effectively** as possible using only **free services**.  
It started as a **Single Page Application (SPA)** but evolved into a **full-stack project** after customer feedback to enable editable translations and future booking payments.

---

### 🌐 Domain
- **Provider:** [Porkbun](https://porkbun.com/)  
- **Managed with:** [Cloudflare](https://www.cloudflare.com/)  

Cloudflare provides DNS management, CDN caching, analytics, and DDoS protection.

---

### 🎨 Frontend
- **Framework:** React.js  
- **Hosting:** Cloudflare Pages  
- **Theme:** [Material Kit 2 React](http://demos.creative-tim.com/material-kit-react/)

Cloudflare Pages delivers fast and free static hosting ideal for React apps.

---

### ⚙️ Backend
- **Hosting:** [Render.com](https://render.com/) (Free Plan)  
- **Inactivity Issue:** Backend sleeps after 15 minutes of inactivity.  
- **Solution:** [UptimeRobot](https://uptimerobot.com/) pings the server regularly to prevent downtime.

A simple root route (`/`) serves a redirect to the frontend and keeps the backend active.

---

### 🗄️ Database
- **Provider:** [Supabase](https://supabase.com/)  
- **Purpose:** Store users, translations, activities, amenities, and article data.  
- **Challenge:** Database suspends after 7 days of inactivity.  
- **Solution:** UptimeRobot triggers daily checks to maintain uptime.

---

### 🤖 AI Integration
- **Provider:** [OpenRouter](https://openrouter.ai/)  
- **Model:** `tngtech/deepseek-r1t2-chimera:free`  

Used for generating activity-related articles via structured JSON prompts.

**Prompt Example:**
Here are parts of a webpage:
Page 'x' content:
'content found in URLs provided'


Generate me an article that includes things like the price, location, services offered, values and give a good reason why it would be a good place to visit without sounding generic.
If the web pages don't include any information on the previously mentioned items, then don't include them and find something else that would be good to know.
The article should follow this schema:
```json
{
  "title": "Main title, avoid special characters (@,:,,'...)",
  "image": "Provide a full URL or leave blank",
  "description": "Short summary of the article",
  "article": [{
    "title": "Section 1",
    "content": "Main text...",
    "detail": ["Item 1", "Item 2"]
  }]
}
```

the article section must also be in json format.
I'd prefer if the price was listed in the details
if they have services available, then list them in detail
Don't feel obligated to add details in the article section.
Only add the details section if necessary.
Respond with valid JSON only.


---

## 🧠 Future Improvements

- Integrate secure online payment processing for bookings  
- Migrate to paid tiers for improved uptime and reliability  
- Enhance SEO and mobile responsiveness  

---

## 👨‍💻 Developer Information

**Production link:** https://4roses.fignet.ca/ 
**Staging link:** https://4roses.dev.fignet.ca/
