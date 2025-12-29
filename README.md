# Voice AI Frontend (Next.js)

A Next.js frontend application for a voice AI system with real-time chat, voice interaction, and file upload capabilities.

## Prerequisites

- Node.js (v18 or higher)
- Backend server running (see backend README)
- npm, yarn, pnpm, or bun package manager

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**To get a Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key and add it to your `.env.local` file
6. (Optional) Restrict the API key to your domain for security

**Note:** The frontend connects to the backend at `http://localhost:4000` by default. If your backend runs on a different URL, update the `API_BASE_URL` in `types/contstants.ts`.

### 3. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 4. Production Build

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Features

- **Real-time Chat**: WebSocket-based chat interface
- **Voice Interaction**: Voice input and output capabilities
- **File Upload**: Upload and manage documents
- **Authentication**: Secure login and session management
- **Conversation History**: View and manage past conversations
- **Agricultural Knowledge Base**: Comprehensive database of crops, pests, and treatment recommendations

## Agricultural Data

The application has been trained and tested on an extensive agricultural knowledge base:

### Crops Database (223 crops)

The system includes comprehensive data on:
- **Vegetables**: Carrots, Broccoli, Cabbage, Lettuce, Spinach, Tomatoes, Peppers, Onions, Potatoes, Sweet Potatoes, Cucumbers, Pumpkins, and many more
- **Fruits**: Apples, Oranges, Lemons, Grapes, Mangoes, Bananas, Peaches, Pears, Plums, and various citrus fruits
- **Grains**: Maize, Wheat, Barley, Oats, Rice, Sorghum, and Triticale
- **Nuts**: Pecan Nuts, Macadamia Nuts, Cashew Nuts, Almonds, Walnuts, and more
- **Herbs & Spices**: Basil, Rosemary, Thyme, Sage, Parsley, Coriander, Mint, and various others
- **Legumes**: Beans, Peas, and various bean varieties
- **Other**: Cotton, Tobacco, Sugarcane, Sunflower, Canola, and many specialty crops

### Pests Database (192 pests)

The system covers a wide range of agricultural pests including:
- **Insects**: Aphids (multiple varieties), Mites (Red spider mite, Two-spotted spider mite, etc.), Thrips, Scale insects, Mealybugs, Ants, and various caterpillars
- **Diseases**: Fungal diseases (Powdery mildew, Downy mildew, Rust, Blight, etc.), Bacterial diseases (Bacterial spot, Bacterial blight), and various leaf spots
- **Nematodes**: Root-knot nematode, Dagger nematode, Ring nematode, and others
- **Weeds**: Broadleaf weeds, Grass weeds, Sedges, and Noxious weeds
- **Other Pests**: Leaf miners, Bollworms, Army worms, Cutworms, and various agricultural pests

### Crop-Pest Relationships (1,163 combinations)

The system has been trained on **1,163 unique crop-pest relationships**, enabling it to provide specific recommendations for:

- **Vegetable-Pest Combinations**: 
  - Tomato: Early blight, Late blight, Anthracnose, Aphids, Bollworm, White fly, Bacterial spot, Mites, Leaf miners
  - Potato: Early blight, Late blight, Downy mildew, Potato tuber moth, Bollworm, Cutworm, Fusarium, Dry rot, Common scab
  - Cabbage: Diamond back moth, Greater cabbage moth, Aphids, Army worm, Downy mildew, Thrips, White blister
  - Carrots: Thrips, Leaf spot, Early blight, Alternaria, Cutworm, Powdery mildew, Botrytis

- **Fruit-Pest Combinations**:
  - Apples: Mites, Powdery mildew, Scab, Codling moth, Aphids, Bollworm, Oriental fruit moth, Fruit Fly
  - Grapes: Mealy bug, Downy mildew, Mites, Thrips, Anthracnose, Bollworm, Botrytis, Powdery mildew, Fruit Fly
  - Lemons: Various mites, Bollworm, Aphids, Mealy bug, Scale insects, Thrips, Scab, Nematodes, Black spot

- **Grain-Pest Combinations**:
  - Maize: Stalk borer, Army worms, Bollworm, Black maize beetle, Aphids, Rust, Leaf spot, Cob smut, Downy mildew
  - Wheat: Bollworm, Nematodes, Army worms, Aphids (Russian wheat aphid, Green aphid, Brown aphid), Rust, Powdery mildew, Smut diseases
  - Barley: Leaf spot, Net blotch, Rust, Powdery mildew, Smut diseases, Bollworm, Army worms, Aphids

- **Legume-Pest Combinations**:
  - Green Beans: Bollworm, Rust, Thrips, Mites, Anthracnose, Halo blight, Bacterial blight, Army worms, Aphids
  - Beans: Rust, Root rot, Aphids, Bacterial blight, Halo blight, Common blight, Bollworm, Thrips, Mites
  - Peas: Powdery mildew, Mites, Thrips, White fly, Army worms, Bollworm, Downy mildew, Anthracnose

**Example Queries**: Users can ask questions like:
- "What should I do about aphids on my tomatoes?"
- "How do I treat early blight on potatoes?"
- "What pests affect maize crops?"
- "Tell me about bollworm on cotton"

## Project Structure

```
app/
├── (dashboard)/      # Protected dashboard routes
│   ├── chat/         # Chat interface
│   ├── history/      # Conversation history
│   ├── settings/     # User settings
│   └── policies/     # Policies page
├── login/            # Login page
└── layout.tsx        # Root layout

components/
├── VoiceChat.tsx     # Voice chat component
├── ChatMessages.tsx  # Chat messages display
├── FileUpload.tsx    # File upload component
└── ...               # Other components

context/
├── AuthContext.tsx   # Authentication context
└── SocketContext.tsx # WebSocket context
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run pm2:start` - Start with PM2
- `npm run pm2:stop` - Stop PM2 process
- `npm run pm2:logs` - View PM2 logs

## Backend Connection

The frontend connects to the backend API at `http://localhost:4000`. Make sure the backend server is running before starting the frontend.

## Troubleshooting

- **Connection Issues**: Ensure the backend server is running on port 4000
- **Authentication Errors**: Verify your credentials and check backend authentication endpoints
- **WebSocket Issues**: Check that the backend WebSocket gateway is properly configured

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
