import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env")
];
const envFile = envCandidates.find((file) => {
  try {
    readFileSync(file);
    return true;
  } catch {
    return false;
  }
});
if (envFile) config({ path: envFile });

const prisma = new PrismaClient();

interface PlaceSeed {
  slug: string;
  name: string;
  category: string;
  area: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  priceLevel: number;
}

interface PlanSeed {
  slug: string;
  title: string;
  description: string;
  durationHours: number;
  budgetMin: number;
  budgetMax: number;
  imageUrl: string;
  stops: Array<{ placeSlug: string; name: string; note: string }>;
}

const dataDir = path.resolve(process.cwd(), "prisma/data");
const places = JSON.parse(readFileSync(path.join(dataDir, "places.json"), "utf8")) as PlaceSeed[];
const plans = JSON.parse(readFileSync(path.join(dataDir, "plans.json"), "utf8")) as PlanSeed[];

const photoPools: Record<string, string[]> = {
  Nature: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80"
  ],
  Cafe: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1200&q=80"
  ],
  Food: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
  ],
  Heritage: [
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80"
  ],
  Shopping: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=80"
  ],
  Nightlife: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80"
  ],
  Museum: [
    "https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80"
  ],
  Temple: [
    "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600100397608-f010a4a30b1e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?auto=format&fit=crop&w=1200&q=80"
  ],
  Entertainment: [
    "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1567604130959-7ea7bf4b4b16?auto=format&fit=crop&w=1200&q=80"
  ],
  Art: [
    "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
  ],
  Neighborhood: [
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"
  ]
};

const userSeeds = [
  { name: "Demo Explorer", email: "demo@webuild.app", password: "demo1234" },
  { name: "Aarav Rao", email: "aarav@webuild.app", password: "bangalore123" },
  { name: "Meera Iyer", email: "meera@webuild.app", password: "bangalore123" },
  { name: "Kabir Shah", email: "kabir@webuild.app", password: "bangalore123" },
  { name: "Ananya Menon", email: "ananya@webuild.app", password: "bangalore123" },
  { name: "Rohan Gowda", email: "rohan@webuild.app", password: "bangalore123" },
  { name: "Isha Kulkarni", email: "isha@webuild.app", password: "bangalore123" },
  { name: "Vikram Shetty", email: "vikram@webuild.app", password: "bangalore123" }
];

const comments = [
  "Perfect early-morning stop.",
  "Loved the vibe, will come back.",
  "Busy but worth it.",
  "Great value for a weekend.",
  "Good food, slightly crowded.",
  "Beautiful place for photos.",
  "A little touristy but still fun.",
  "Solid recommendation for first-timers."
];

function daysAgo(days: number, hours = 0): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000);
}

async function main(): Promise<void> {
  await prisma.activityEvent.deleteMany();
  await prisma.savedPlan.deleteMany();
  await prisma.savedPlace.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.planStop.deleteMany();
  await prisma.weekendPlan.deleteMany();
  await prisma.placePhoto.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  const users = [];
  for (const seed of userSeeds) {
    const user = await prisma.user.create({
      data: {
        name: seed.name,
        email: seed.email,
        passwordHash: await bcrypt.hash(seed.password, 10)
      }
    });
    users.push(user);
  }

  const placeIdBySlug = new Map<string, string>();
  for (const place of places) {
    const created = await prisma.place.create({
      data: {
        slug: place.slug,
        name: place.name,
        category: place.category,
        area: place.area,
        address: place.address,
        description: place.description,
        latitude: place.latitude,
        longitude: place.longitude,
        imageUrl: place.imageUrl,
        priceLevel: place.priceLevel,
        photos: {
          create: [
            { url: place.imageUrl, alt: `${place.name} main view`, order: 0 },
            ...(photoPools[place.category] ?? photoPools["Nature"])
              .filter((url) => url !== place.imageUrl)
              .slice(0, 2)
              .map((url, index) => ({
                url,
                alt: `${place.name} atmosphere`,
                order: index + 1
              }))
          ]
        }
      }
    });
    placeIdBySlug.set(place.slug, created.id);
  }

  const planIdBySlug = new Map<string, string>();
  for (const plan of plans) {
    const created = await prisma.weekendPlan.create({
      data: {
        slug: plan.slug,
        title: plan.title,
        description: plan.description,
        durationHours: plan.durationHours,
        budgetMin: plan.budgetMin,
        budgetMax: plan.budgetMax,
        imageUrl: plan.imageUrl,
        stops: {
          create: plan.stops.map((stop, index) => ({
            name: stop.name,
            note: stop.note,
            order: index,
            placeId: placeIdBySlug.get(stop.placeSlug) ?? null
          }))
        }
      }
    });
    planIdBySlug.set(plan.slug, created.id);
  }

  const ratingEvents: Array<{
    type: string;
    placeId: string;
    userId: string | null;
    createdAt: Date;
  }> = [];

  for (const [placeIndex, place] of places.entries()) {
    const placeId = placeIdBySlug.get(place.slug);
    if (!placeId) continue;

    const ratingCount = 3 + (placeIndex % 3);
    for (let offset = 0; offset < ratingCount; offset += 1) {
      const user = users[(placeIndex + offset) % users.length];
      if (!user) continue;
      const ratingValue = 3 + ((placeIndex + offset) % 3);
      await prisma.rating.create({
        data: {
          userId: user.id,
          placeId,
          rating: ratingValue,
          comment: comments[(placeIndex + offset) % comments.length] ?? null
        }
      });
      ratingEvents.push({
        type: "RATING",
        placeId,
        userId: user.id,
        createdAt: daysAgo(placeIndex % 7, offset)
      });
    }
  }

  const viewEvents: Array<{
    type: string;
    placeId: string;
    userId: string | null;
    createdAt: Date;
  }> = [];
  const saveEvents: typeof viewEvents = [];

  for (const [placeIndex, place] of places.entries()) {
    const placeId = placeIdBySlug.get(place.slug);
    if (!placeId) continue;

    const views = 20 + ((placeIndex * 5) % 30);
    for (let index = 0; index < views; index += 1) {
      viewEvents.push({
        type: "VIEW",
        placeId,
        userId: null,
        createdAt: daysAgo(placeIndex % 7, (index % 12) + 1)
      });
    }

    const saves = placeIndex % 4;
    for (let index = 0; index < saves; index += 1) {
      const user = users[(placeIndex + index + 1) % users.length];
      saveEvents.push({
        type: "SAVE",
        placeId,
        userId: user?.id ?? null,
        createdAt: daysAgo((placeIndex + index) % 7, 3)
      });
    }
  }

  await prisma.activityEvent.createMany({
    data: [...viewEvents, ...saveEvents, ...ratingEvents]
  });

  const demoUser = users[0];
  if (demoUser) {
    const demoPlaces = [
      "lalbagh-botanical-garden",
      "third-wave-coffee-indiranagar",
      "nandi-hills"
    ];
    for (const slug of demoPlaces) {
      const placeId = placeIdBySlug.get(slug);
      if (!placeId) continue;
      await prisma.savedPlace.create({
        data: { userId: demoUser.id, placeId }
      });
    }

    const demoPlans = ["cubbon-park-church-street-day", "indiranagar-cafe-hop"];
    for (const slug of demoPlans) {
      const planId = planIdBySlug.get(slug);
      if (!planId) continue;
      await prisma.savedPlan.create({
        data: { userId: demoUser.id, planId }
      });
    }
  }

  console.log(`Seeded ${places.length} places, ${plans.length} plans and ${users.length} users.`);
  console.log("Demo login: demo@webuild.app / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
