# Instructions for Judges/Evaluators

## Live Platform Access

**You can access the live application directly at:**

🌐 **https://field-voice.balanceapp.co.za/**

No local setup required! Simply visit the URL above and use the test credentials below to log in.

## Test Credentials

Please use the following credentials to access the application:

- **Email:** `dyorajackson@gmail.com`
- **Password:** `123456`

## Quick Start Guide (Local Development)

If you prefer to run the application locally, follow these steps:

### Step 1: Start the Backend Server

1. Navigate to the backend directory (`eleven/`)
2. Install dependencies (if not already done):
   ```bash
   yarn install
   ```
3. Start the backend server:
   ```bash
   yarn dev
   ```
4. Verify the backend is running at `http://localhost:4000`

### Step 2: Start the Frontend Server

1. Navigate to the frontend directory (`voice-frontend/`)
2. Install dependencies (if not already done):
   ```bash
   yarn install
   ```
3. Start the frontend server:
   ```bash
   yarn dev
   ```
4. The application will be available at `http://localhost:3000`

### Step 3: Login to the Application

**Option A: Live Platform (Recommended)**
1. Open your browser and go to: **https://field-voice.balanceapp.co.za/**
2. You will be redirected to the login page
3. Enter the test credentials:
   - **Email:** `dyorajackson@gmail.com`
   - **Password:** `123456`
4. Click "Login" to access the dashboard

**Option B: Local Development**
1. Open your browser and go to: **http://localhost:3000**
2. You will be redirected to the login page
3. Enter the test credentials:
   - **Email:** `dyorajackson@gmail.com`
   - **Password:** `123456`
4. Click "Login" to access the dashboard

## What to Test

Once logged in, you can evaluate the following features:

- ✅ **Authentication**: Login functionality
- ✅ **Chat Interface**: Real-time messaging with the AI
- ✅ **Voice Features**: Voice input and output capabilities
- ✅ **File Upload**: Document upload and management
- ✅ **Conversation History**: View and navigate past conversations
- ✅ **WebSocket Connection**: Real-time updates and communication

## Tested Crops and Pests

The application has been tested and validated with the following crops and pests:

### Tested Crops (223 crops)

The system has been tested with a comprehensive list of crops including:
- **Vegetables**: Carrots, Broccoli, Cabbage, Lettuce, Spinach, Tomatoes, Peppers, Onions, Potatoes, Sweet Potatoes, Cucumbers, Pumpkins, and many more
- **Fruits**: Apples, Oranges, Lemons, Grapes, Mangoes, Bananas, Peaches, Pears, Plums, and various citrus fruits
- **Grains**: Maize, Wheat, Barley, Oats, Rice, Sorghum, and Triticale
- **Nuts**: Pecan Nuts, Macadamia Nuts, Cashew Nuts, Almonds, Walnuts, and more
- **Herbs & Spices**: Basil, Rosemary, Thyme, Sage, Parsley, Coriander, Mint, and various others
- **Legumes**: Beans, Peas, and various bean varieties
- **Other**: Cotton, Tobacco, Sugarcane, Sunflower, Canola, and many specialty crops

### Tested Pests (192 pests)

The system has been tested with an extensive pest database including:
- **Insects**: Aphids (multiple varieties), Mites (Red spider mite, Two-spotted spider mite, etc.), Thrips, Scale insects, Mealybugs, Ants, and various caterpillars
- **Diseases**: Fungal diseases (Powdery mildew, Downy mildew, Rust, Blight, etc.), Bacterial diseases (Bacterial spot, Bacterial blight), and various leaf spots
- **Nematodes**: Root-knot nematode, Dagger nematode, Ring nematode, and others
- **Weeds**: Broadleaf weeds, Grass weeds, Sedges, and Noxious weeds
- **Other Pests**: Leaf miners, Bollworms, Army worms, Cutworms, and various agricultural pests

**Note**: The complete database includes 223 crops and 192 pests that have been tested and validated within the system. You can query the AI about any of these crops or pests to see how the system responds and provides relevant agricultural information.

### Tested Crop-Pest Combinations

The system has been trained and tested on **over 1,100 crop-pest relationships**. Here are some representative examples of the crop-pest combinations that have been validated:

#### Vegetables
- **Carrots**: Thrips, Leaf spot, Early blight, Alternaria, Cutworm, Powdery mildew, Botrytis, Weeds (Broadleaf & Grass)
- **Tomato**: Early blight, Late blight, Anthracnose, Leaf spot, Botrytis, Aphids, Bollworm, White fly, Bacterial spot, Mites, Leaf miners, and more
- **Cabbage**: Diamond back moth, Greater cabbage moth, Aphids, Army worm, Downy mildew, Thrips, White blister, Alternaria, Bollworm
- **Broccoli**: Aphids, Diamond back moth, Thrips, White fly, Bollworm, Downy mildew, Leaf spot, Semi-looper, Greater cabbage moth
- **Potato**: Early blight, Late blight, Downy mildew, Alternaria, Potato tuber moth, Bollworm, Cutworm, Fusarium, Dry rot, Common scab, Leaf miners, Army worms
- **Onion**: Thrips, Downy mildew, Sclerotinia rot, Purple blotch, Botrytis, Alternaria, Leaf miners, Fusarium
- **Pepper**: False codling moth, White fly, Leaf spot, Anthracnose, Aphids, Grey mould, Powdery mildew, Semi-looper, Bacterial spot, Bollworm, Thrips

#### Fruits
- **Lemons**: Mites (Rust mite, Red spider mite, Lowveld mite, Bud mite), Bollworm, Aphids, Mealy bug, Orange dog caterpillar, Scale insects, Thrips, Scab, Nematodes, Alternaria spot, Ants, Psylla, Black spot, Anthracnose
- **Apples**: Mites (Bud mite, Red spider mite, European red mite, Two-spotted spider mite), Powdery mildew, Scab, Leaf spot, Codling moth, Army worm, Weevils, Leaf roller, Aphids, Bollworm, Stinkbug, Scale, Mealy bug, Thrips, Botrytis, Oriental fruit moth, Fruit Fly
- **Grapes**: Mealy bug, Downy mildew, Weevils, Dead arm, Mites (Two-spotted spider mite, Erinose mite), Thrips, Anthracnose, Bollworm, Botrytis, Powdery mildew, Ants, False codling moth, Fruit Fly, Black spot
- **Mangoes**: Bacterial spot, Anthracnose, Mealy bug, Powdery mildew, Thrips
- **Oranges**: Aphids, Army worm, Psylla, Scale (Red scale), Blue mould

#### Grains & Cereals
- **Maize**: Stalk borer, Army worms (Fall armyworm, Lesser army worm), Bollworm, Black maize beetle, Aphids, Rust, Leaf spot, Cob smut, Downy mildew, Mites, Weevils, Cercospora leaf spot, Astylus beetle, Nematodes, Cutworm, Leaf rust
- **Wheat**: Bollworm, Nematodes, Army worms (Fall armyworm, Lesser army worm), Aphids (Russian wheat aphid, Green aphid, Brown aphid), Leaf miner, Weevils, Rust, Glume blotch, Powdery mildew, Leaf rust, Loose smut, Stinking smut, Speckled leaf blotch
- **Barley**: Leaf spot, Leaf miner, Weevils, Net blotch, Rust (Leaf rust), Powdery mildew, Covered smut, Loose smut, Bollworm, Army worms, Aphids, False chinch bug, Rust
- **Sorghum**: Stalk borer, Bollworm, Black maize beetle, Army worms, Weevils, Cutworm, Aphids, Rust
- **Rice**: Weeds (Broadleaf & Grass), Weevils

#### Legumes
- **Green Beans**: Bollworm, Rust (Bean rust), Thrips, Mites (Red spider mite, Two-spotted spider mite), Weeds, Anthracnose, Halo blight, Bacterial blight, Army worms, Aphids, Leaf miners, Semi-looper
- **Beans**: Rust, Root rot, Aphids, Black maize beetle, Bacterial blight, Halo blight, Common blight, Bollworm, Anthracnose, Bean rust, Weevils, Cutworm, Rust (Soyabean rust), Sclerotinia rot, Thrips, Mites, Army worms, Grey mould, Powdery mildew, Leaf rust, Leaf miners
- **Peas**: Powdery mildew, Mites, Thrips, White fly, Army worms, Bollworm, Downy mildew, Anthracnose, Weevils, Cutworm, Sclerotinia rot, Aphids, Leaf miners

#### Other Crops
- **Cotton**: Mites (Red spider mite, Two-spotted spider mite), Bollworm, Stainers, Semi-looper, Aphids, Cutworm, Army worms, Leaf hopper, Thrips, Cotton Aphids, Damping-off
- **Tobacco**: Bollworm, Leaf miner, Cutworm, Stinkbug, Army worms, Nematodes, Weevils, Aphids, Bollworm, Potato tuber moth, Leaf miners, Sclerotinia rot, White fly, Sclerotinia
- **Sugarcane**: Nematodes, Weeds (Broadleaf, Grass, Sedges), Army worms, Thrips
- **Sunflower**: Nematodes, Downy mildew, Alternaria spot, Weevils, Bollworm, Army worms

**Total Training Data**: The system has been trained on **1,163 unique crop-pest relationships** covering a wide range of agricultural scenarios. You can test the system by asking questions about any of these specific crop-pest combinations, such as:
- "What should I do about aphids on my tomatoes?"
- "How do I treat early blight on potatoes?"
- "What pests affect maize crops?"
- "Tell me about bollworm on cotton"

## Important Notes

- **Both servers must be running** for the application to work properly
- The backend must be started **before** the frontend
- Ensure your MySQL database is running and the `farm_voice_ai` database exists
- If you encounter connection errors, check that both servers are running on the correct ports


## Need Help?

Refer to the detailed README files for more information:
- Backend setup: `eleven/README.md`
- Frontend setup: `voice-frontend/README.md`

