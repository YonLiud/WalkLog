# Walk Log

A mobile-first web application for tracking kennel cage care. Each cage has Inner and Outer cells that can be marked as "Not yet", "Walked", or "Do not walk" with optional notes per cage. Built with React, Next.js, and Supabase for persistent storage.

## Features
   
- ✅ Mobile-first responsive design
- ✅ Quick tap to cycle through states: Not yet → Walked → Do not walk
- ✅ Optional notes per cage with auto-save
- ✅ Real-time updates across devices
- ✅ Visual status indicators with color coding
- ✅ Progress tracking and statistics

# Demo

### Desktop

<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/265a9762-007e-421d-b757-085aaca71348" />

### Mobile

<img width="512" height="1141" alt="image" src="https://github.com/user-attachments/assets/2fb6bfd2-48fe-433e-9cd8-ba1e9c0cfe44" />


## Technology Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Deployment**: Vercel (recommended)

## Database Schema

| Column    | Type                  | Description                      |
|-----------|-----------------------|----------------------------------|
| id        | int (PK, auto-increment) | Unique row ID                  |
| cage_num  | int                   | Kennel number (1, 2, 3…)        |
| cell_side | text                  | "Inner", "Outer", or "Both"      |
| state     | int                   | 0 = Not yet, 1 = Walked, 2 = Do not walk |
| notes     | text                  | Optional note for the cage/cell  |

## Usage

### Basic Operations

1. **Change Cage State**: Tap any cage card to cycle through states:
   - Gray: "Not yet" (default)
   - Green: "Walked" 
   - Red: "Do not walk"

2. **Add Notes**: 
   - Tap the "Notes" section to expand
   - Type your notes (auto-saves 500ms after stopping)
   - Notes save immediately when you tap outside the text area

3. **Real-time Updates**: Changes sync automatically across all devices

### Mobile Usage

- Optimized for touch interaction
- Large tap targets for easy use
- Sticky header for quick reference
- No zoom required on mobile devices

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page (renders CageDashboard)
│   └── globals.css         # Global styles
├── components/
│   ├── CageCard.tsx        # Individual cage card component
│   └── CageDashboard.tsx   # Main dashboard with all cages
└── lib/
    ├── supabase.ts         # Supabase client configuration
    └── cageService.ts      # Database service functions
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard
4. Deploy!

The app will be available at your Vercel URL and ready for mobile use.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run code linting
- `npm run format` - Format code with Biome

### Adding New Features

- **New cage operations**: Add functions to `cageService.ts`
- **UI changes**: Modify components in `src/components/`
- **Database changes**: Update the schema in `database/setup.sql`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
