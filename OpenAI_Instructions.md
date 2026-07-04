# OpenAI Image Generation: Quick Setup Guide

If you decide you want to instantly generate the remaining 100+ exercises across your library using the OpenAI API instead of waiting days, follow these simple instructions. 

This process will target the `Weights`, `Cardio`, and `No Equipment` categories. It has been strictly programmed to completely ignore your `Slide Board` exercises, your custom `CF#` exercises, and **any exercise where you have already added a custom image**. It is 100% safe.

---

### Step 1: Get Your API Key
1. Go to [OpenAI's Developer Platform](https://platform.openai.com/) and create an account or log in.
2. Navigate to **API Keys** on the left-hand dashboard.
3. Click the button that says **Create new secret key**, name it something like "GDFT Images", and copy the long string it gives you (it starts with `sk-`).
4. You will need to add a few dollars of credit to your OpenAI billing account (DALL-E 3 costs $0.04 per image. For roughly 100 exercises * 2 poses, it will cost exactly **$8.00** to finish your entire library).

### Step 2: Install the Tools
Open your VSCode terminal (where your `npm run dev` normally runs) and run this single command to install the required OpenAI library:
```bash
npm install openai
```

### Step 3: Add Your Key to the Script
I have created a dedicated script file for you in your project folder named `generate-openai-images.js`. 
1. Open `generate-openai-images.js` in VSCode.
2. Look at **Line 10**.
3. Replace the text `YOUR_API_KEY_HERE` with the actual secret key you copied from OpenAI in Step 1.
4. Save the file.

### Step 4: Run It!
When you are ready to generate all the images, simply type this command into your VSCode terminal and hit Enter:
```bash
node generate-openai-images.js
```

**What happens next?**
You can sit back and relax. The script will automatically ping OpenAI, download all the new realistic 3D model images into your `public/icons/` folders, and automatically connect them to the exercises inside your `data.ts` database. It should take about 10 minutes to process the entire library.
