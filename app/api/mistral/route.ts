import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Mistral } from "@mistralai/mistralai";

// Load env variables
dotenv.config();


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const Config = {
  apiKey: "AIzaSyAovnsa3ObT8NYfqvlQyy00g-hFl5Snd8g",
  authDomain: "spiritual-aloe-372507.firebaseapp.com",
  projectId: "spiritual-aloe-372507",
  storageBucket: "spiritual-aloe-372507.appspot.com",
  messagingSenderId: "533431675194",
  appId: "1:533431675194:web:40a8a5d16776fa89464803",
  measurementId: "G-35L984LSBK",
};

// Initialize Firebase
export const app = initializeApp(Config);
export const auth = getAuth(app);
export const db = getFirestore();
export const googleAuthProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const firestore = getFirestore(app);
export const timestamp = serverTimestamp;

const apiKey = "euKaqequj81jSAJsvtatq1Y2UclBQkuj"; // pranjal
// const apiKey = "30pd6PKShBIRGVFXNHO2QotSlKB8rQhG"; // kausar

const client = new Mistral({ apiKey });
interface TourDetails {
  title: string;
  pois?: string[];
  duration?: string;
}

function cleanHTMLResponse(content: string): string {
  return content
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .replace(/\n/g, "");
}

function buildPart1Prompt({ title, pois = [], duration }: TourDetails): string {
  const actionWords = [
    'Exploring', 'Unveiling', 'Revealing', 'Immersing in', 
    'Wandering through', 'Journeying through', 'Experiencing', 
    'Delving into'
  ];

  const formattedPOIs = pois.length > 0
    ? pois.slice(0, 8).map((poi: string) => {
        const action = actionWords[Math.floor(Math.random() * actionWords.length)];
        return `<h1><strong>${action} ${poi}</strong></h1>
<p>Describe this place using 2–3 vivid, sensory-rich sentences. Focus on what a traveler might see, hear, smell, feel, and emotionally experience. Make it immersive and emotionally engaging.</p>`;
      }).join("\n\n")
    : `<h1><strong>Exploring Iconic Landmarks</strong></h1>
<p>Introduce 2–3 cultural or scenic sites. Use vivid, story-driven language to immerse the reader in what they might experience at each stop.</p>`;

  return `
Respond only with valid HTML. Do NOT include backticks or markdown formatting.

<h1>${title}</h1>

<p>
This ${duration || 'tour'} invites travelers on a journey through breathtaking destinations that awaken the senses and connect deeply with local culture and nature. Each place offers a distinct rhythm, atmosphere, and story that stays with you long after the journey ends.
</p>

<h2>Tour Overview</h2>
<p>
Write 2–3 vivid, emotional sentences that describe the overall tour experience. Use sensory-rich, immersive language. Do not include this instruction in the response — only return the final content in valid HTML.</p>

<p>
Write ~100 words on the emotional and cultural essence of the tour</p>

${formattedPOIs}

<h2>Memorable Moments</h2>
<ul>
  <li>List 2–4 emotional or visually powerful highlights from the trip. Use 1–2 vivid sentences for each. Examples: a sunset over the hills, a joyful cultural exchange, a serene boat ride at dusk.</li>
</ul>

<p>
Close with a short, inviting paragraph that encourages the reader to join the tour and create unforgettable memories.
</p>
`;
}


function buildPart2Prompt(title: string, pois: string[] = []): string {
  const promptHeader = "Respond only with valid HTML. Do NOT wrap the output in triple backticks or markdown code blocks.\n\n";
  
  const poisLine = pois.length > 0
    ? `The tour includes experiences in places like ${pois.slice(0, 5).join(", ")}. Be sure to reflect their cultural and emotional impact in your writing.`
    : "The tour includes several culturally and scenically rich destinations. Reflect their emotional and sensory impact in your writing.";

  return promptHeader + `
<h1>What's Included</h1>
<ul>
<li>At least 8 inclusions: transport, hotel, meals, guide, entrances, cultural experiences, transfers, and unique features.</li>
<li>describe each inclusion with warmth, texture, and emotion related to ${poisLine}.</li>
</ul>
<p>
Write ~250 words on the emotional and cultural essence of the tour. Mention connections with people, food, landscapes, and especially the significance of key locations. ${poisLine}
</p>
<p>
Write ~250 words on how the journey feels—comfort, warmth, surprises, bonding, and scenic moments. Let the experience of being in these places come alive.
</p>
<p>Use only valid HTML tags: <h1>, <p>, <ul>, <li>, <strong>, <em>, <br>. Avoid <div> and scripts.</p>
`;
}

  

async function generateDescription({ title, pois, duration }: any) {
  const part1Prompt = buildPart1Prompt({ title, pois, duration });
const part2Prompt = buildPart2Prompt(title, pois);

  const chatResponse1: any = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: part1Prompt }],
  });

  const chatResponse2: any = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: part2Prompt }],
  });

  const descriptionPart1 = cleanHTMLResponse(
    chatResponse1.choices[0].message.content
  );
  const descriptionPart2 = cleanHTMLResponse(
    chatResponse2.choices[0].message.content
  );
  return descriptionPart1 + descriptionPart2;
}

function convertDuration(seconds: any) {
  const days = Math.floor(seconds / 86400); // 1 day = 86400 seconds
  const hours = Math.floor((seconds % 86400) / 3600); // 1 hour = 3600 seconds
  const minutes = Math.floor((seconds % 3600) / 60); // 1 minute = 60 seconds

  let durationString = "";
  if (days > 0) durationString += `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) durationString += ` ${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes > 0)
    durationString += ` ${minutes} minute${minutes > 1 ? "s" : ""}`;

  return durationString.trim() || "less than 1 minute";
}

// Example usage
const tourDurationInSeconds = 36000; // Adjust this to your actual field
const readableDuration = convertDuration(tourDurationInSeconds);
console.log(readableDuration); // Outputs: "10 hours"

import { NextRequest, NextResponse } from "next/server"; // For Next.js 13 and above

// export async function GET(req: NextRequest) {
//   try {
//     const docPath =
//       "TOUR-AND-TRAVELS-INFORMATION/IN/TOUR-PACKAGE-INFORMATION/11-days-leh-ladakh-road-trip-from-delhi";

//       const tourDocRef = doc(db, docPath); // ✅ Correct modular usage
//       const tourSnapshot = await getDoc(tourDocRef); // ✅ Correct modular usage
  
//     // Check if the document exists
//     if (!tourSnapshot.exists) {
//       throw new Error(`No document found at path: ${docPath}`);
//     }

//     // Extract the tour data
//     const tour:any = tourSnapshot.data();
//     const title = tour.tour_Name || tour.title;
//     const durationInSeconds = tour.tour_Duration || 0;
//     const duration = convertDuration(durationInSeconds); // Convert duration to a readable format

//     // Get the list of points of interest (POIs)
//     const pois = Array.isArray(tour.tour_Point_Of_Interest_Slug_List)
//       ? tour.tour_Point_Of_Interest_Slug_List
//       : [];

//     // Validate if required fields are present
//     if (!title || !duration) {
//       throw new Error("Missing required tour data: title or duration");
//     }

//     console.log(`Generating description for: ${title}`);

//     // Generate the full description using the helper function
//     const fullDescription = await generateDescription({
//       title,
//       pois,
//       duration,
//     });

//     // Prepare the response data
//     const result = {
//       key: title,
//       description: fullDescription,
//     };
  
//     const outputFile = path.join("/tmp", "single_tour_description.json");
// fs.writeFileSync(outputFile, JSON.stringify([result], null, 2), "utf8");


//     return NextResponse.json({ success: true , fullDescription }, { status: 200 });
//   } catch (err: any) {
//     console.error("Error:", err);
//     return NextResponse.json(
//       { error: err.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//     try {
//       // Assuming you get the list of slugs from the query parameters or request body
//       const slugs = [
//         "2-days-jaipur-amber-fort-hawa-mahal-tuk-tuk-tour",
//         "2-days-amritsar-adventure-from-delhi-via-superfast-train"
//       ]; // Replace with dynamic slugs if needed
  
//       // Create an array to store the results for each slug
//       const results = [];
  
//       for (const slug of slugs) {
//         const docPath = `TOUR-AND-TRAVELS-INFORMATION/IN/TOUR-PACKAGE-INFORMATION/${slug}`;
  
//         const tourDocRef = doc(db, docPath); // Correct modular usage
//         const tourSnapshot = await getDoc(tourDocRef); // Correct modular usage
  
//         // Check if the document exists
//         if (!tourSnapshot.exists) {
//           throw new Error(`No document found for slug: ${slug}`);
//         }
  
//         // Extract the tour data
//         const tour: any = tourSnapshot.data();
//         const title = tour.tour_Name || tour.title;
//         const durationInSeconds = tour.tour_Duration || 0;
//         const duration = convertDuration(durationInSeconds); // Convert duration to a readable format
  
//         // Get the list of points of interest (POIs)
//         const pois = Array.isArray(tour.tour_Point_Of_Interest_Slug_List)
//           ? tour.tour_Point_Of_Interest_Slug_List
//           : [];
  
//         // Validate if required fields are present
//         if (!title || !duration) {
//           throw new Error("Missing required tour data: title or duration");
//         }
  
//         console.log(`Generating description for: ${title}`);
  
//         // Generate the full description using the helper function
//         const fullDescription = await generateDescription({
//           title,
//           pois,
//           duration,
//         });
  
//         // Add the result to the results array
//         results.push({
//           key: title,
//           description: fullDescription,
//         });
//       }
  
//       // Write the results to a JSON file
//       const outputFile = path.join("/tmp", "multiple_tour_descriptions.json");
//       fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), "utf8");
  
//       // Return the response with the generated descriptions
//       return NextResponse.json({ success: true, results }, { status: 200 });
  
//     } catch (err: any) {
//       console.error("Error:", err);
//       return NextResponse.json(
//         { error: err.message || "Something went wrong" },
//         { status: 500 }
//       );
//     }
//   }

export async function POST(req: NextRequest) {
  try {
    const { slugs } = await req.json(); // Get the list of slugs from the request body

    // Validate that the slugs array is provided
    if (!Array.isArray(slugs) || slugs.length === 0) {
      throw new Error("Invalid slugs array.");
    }

    // Create an array to store the results for each slug
    const results = [];

    // Loop through each slug to fetch and generate descriptions
    for (const slug of slugs) {
      const docPath = `TOUR-AND-TRAVELS-INFORMATION/IN/TOUR-PACKAGE-INFORMATION/${slug}`;

      const tourDocRef = doc(db, docPath);
      const tourSnapshot = await getDoc(tourDocRef);

      if (!tourSnapshot.exists) {
        throw new Error(`No document found for slug: ${slug}`);
      }

      const tour: any = tourSnapshot.data();
      const title = tour.tour_Name || tour.title;
      const durationInSeconds = tour.tour_Duration || 0;
      const duration = convertDuration(durationInSeconds);

      const pois = Array.isArray(tour.tour_Point_Of_Interest_Slug_List)
        ? tour.tour_Point_Of_Interest_Slug_List
        : [];

      if (!title || !duration) {
        throw new Error("Missing required tour data: title or duration");
      }

      const fullDescription = await generateDescription({
        title,
        pois,
        duration,
      });

      results.push({
        key: title,
        description: fullDescription,
        slug
      });
    }

    // Write the results to a JSON file (optional)
    // const outputFile = path.join("/tmp", "multiple_tour_descriptions.json");
    // fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), "utf8");

    return NextResponse.json({ success: true, results }, { status: 200 });

  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
