# 🏆 KNM Paravoor Complex Madrasa Sargamela 2026 — Official Portal

Official mobile-first results portal and admin desk for **KNM Paravoor Complex Madrasa Sargamela 2026**.

- **Live Host**: [https://paravoor-sargamela.msmernakulam.in/](https://paravoor-sargamela.msmernakulam.in/)
- **Repository**: [https://github.com/irfanhabeeb-002/paravoor-complex-sargamela.git](https://github.com/irfanhabeeb-002/paravoor-complex-sargamela.git)

---

## 📱 Mobile-First Public UI

1. **Header**:
   - Partner logos: KNM Education Board Ernakulam, Sargamela Marjaan floral logo, and MSM Balavedi.
   - Arabic calligraphy Bismillah: *بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ*
   - Live portal indicator badge.
   - Title: **KNM Paravoor Complex — മദ്രസ സർഗമേള 2026**
2. **Madrasa Point Table**:
   - Manually updated total standings for the 4 Madrasas in Paravoor Complex:
     - **പുറയാർ**
     - **മാഞ്ഞാലി**
     - **ആളംത്തുരുത്ത്**
     - **പാറാന**
3. **Individual Program Results (1–63)**:
   - Category filters: `ALL` (default) &bull; `KIDS` &bull; `CHILDREN` &bull; `SUB JUNIOR` &bull; `JUNIOR` &bull; `SENIOR`
   - 7-column grid of program number boxes (1 to 63).
   - Clicking a box opens the program result dialog:
     - Displays program name and category.
     - Responsive preview of the uploaded result PDF with direct download and open in new tab options.
     - Clear status notice if the result is pending publication.
4. **Individual Champions**:
   - Enabled and displayed only when manually entered from the Admin desk.
   - Shows champions for Kids, Children, Sub Junior, Junior, and Senior.
5. **Hadeeth Display**:
   - Arabic text, Malayalam translation, and reference entered from Admin.
6. **QR Code Section**:
   - High-quality QR code linking to the live portal for instant mobile sharing.
7. **Footer**:
   - KNM Mujahid Sammelanam conference banner.
   - Subtle credits: *Designed by Ajmal • Developed by Irfan*.

---

## 🔐 Distinct Admin Desk (`/admin`)

- Route: `/admin` (Default passcode: `paravoor2026`)
- **Features**:
  - **Overall Point Table**: Update points for the 4 madrasas.
  - **Program PDF Upload**: Upload, view, and delete official result PDFs for each program (1 to 63).
  - **Individual Champions**: Toggle display and manually enter champion details per category.
  - **Hadeeth Management**: Update Arabic, Malayalam, and reference text.
  - **Supabase Integration**: Configure Supabase URL & Key, test connection, and sync state in real time.

---

## 🗄 Supabase Database & Storage Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run `supabase_schema.sql`.
3. Add your Supabase credentials in `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Or enter them in the Admin Desk settings tab! Offline/local fallback ensures everything functions smoothly even before keys are provided).*

---

## 🚀 Development & Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build
```
