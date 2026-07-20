import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

const CATEGORIES = [
    { name: "Apartment", description: "Family apartments and flats" },
    { name: "House", description: "Independent houses and duplexes" },
    { name: "Studio", description: "Single room studio units" },
    { name: "Sublet", description: "Shared or sublet rooms" },
    { name: "Office", description: "Commercial office spaces" },
];

async function main() {
    const password = await bcrypt.hash("Admin@12345", 12);

    // Admin (public registration দিয়ে ADMIN বানানো যায় না, তাই seed থেকে)
    await prisma.user.upsert({
        where: { email: "admin@rentnest.com" },
        update: {},
        create: {
            name: "RentNest Admin",
            email: "admin@rentnest.com",
            password,
            role: "ADMIN",
        },
    });

    // Demo landlord — এর নামেই property গুলো বসবে
    const landlord = await prisma.user.upsert({
        where: { email: "demo.landlord@rentnest.com" },
        update: {},
        create: {
            name: "Karim Chowdhury",
            email: "demo.landlord@rentnest.com",
            password,
            role: "LANDLORD",
            phone: "01722222222",
            bio: "I own several apartments in Dhaka",
        },
    });

    // Demo tenant
    await prisma.user.upsert({
        where: { email: "demo.tenant@rentnest.com" },
        update: {},
        create: {
            name: "Rahim Uddin",
            email: "demo.tenant@rentnest.com",
            password,
            role: "TENANT",
            phone: "01711111111",
        },
    });

    for (const category of CATEGORIES) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: {
                name: category.name,
                slug: category.name.toLowerCase().replaceAll(" ", "-"),
                description: category.description,
            },
        });
    }

    const apartment = await prisma.category.findUniqueOrThrow({
        where: { name: "Apartment" },
    });
    const house = await prisma.category.findUniqueOrThrow({ where: { name: "House" } });
    const studio = await prisma.category.findUniqueOrThrow({ where: { name: "Studio" } });

    const properties = [
        {
            slug: "lake-view-apartment-dhanmondi",
            categoryId: apartment.id,
            title: "Lake View Apartment in Dhanmondi",
            description: "Spacious 3 bedroom apartment facing Dhanmondi lake.",
            address: "House 24, Road 8, Dhanmondi",
            city: "Dhaka",
            area: "Dhanmondi",
            monthlyRent: 45000,
            securityDeposit: 90000,
            bedrooms: 3,
            bathrooms: 3,
            sizeSqft: 1650,
            amenities: ["parking", "lift", "generator", "security"],
            images: ["https://picsum.photos/seed/rentnest1/800/600"],
        },
        {
            slug: "cozy-studio-banani",
            categoryId: studio.id,
            title: "Cozy Studio Near Banani 11",
            description: "Fully furnished studio, ideal for bachelors and students.",
            address: "Road 11, Banani",
            city: "Dhaka",
            area: "Banani",
            monthlyRent: 18000,
            securityDeposit: 36000,
            bedrooms: 1,
            bathrooms: 1,
            sizeSqft: 550,
            amenities: ["furnished", "wifi", "lift"],
            images: ["https://picsum.photos/seed/rentnest2/800/600"],
        },
        {
            slug: "family-duplex-uttara",
            categoryId: house.id,
            title: "Family Duplex House in Uttara",
            description: "Independent duplex with rooftop garden and garage.",
            address: "Sector 7, Uttara",
            city: "Dhaka",
            area: "Uttara",
            monthlyRent: 75000,
            securityDeposit: 150000,
            bedrooms: 5,
            bathrooms: 4,
            sizeSqft: 3200,
            amenities: ["parking", "garden", "generator"],
            images: ["https://picsum.photos/seed/rentnest3/800/600"],
        },
        {
            slug: "budget-flat-mirpur",
            categoryId: apartment.id,
            title: "Budget Flat in Mirpur 10",
            description: "Affordable 2 bedroom flat close to metro station.",
            address: "Block C, Mirpur 10",
            city: "Dhaka",
            area: "Mirpur",
            monthlyRent: 15000,
            securityDeposit: 30000,
            bedrooms: 2,
            bathrooms: 2,
            sizeSqft: 850,
            amenities: ["lift", "security"],
            images: ["https://picsum.photos/seed/rentnest4/800/600"],
        },
        {
            slug: "sea-facing-flat-chattogram",
            categoryId: apartment.id,
            title: "Sea Facing Flat in Chattogram",
            description: "Bright 3 bedroom flat with sea breeze in Khulshi.",
            address: "Khulshi Hills",
            city: "Chattogram",
            area: "Khulshi",
            monthlyRent: 32000,
            securityDeposit: 64000,
            bedrooms: 3,
            bathrooms: 2,
            sizeSqft: 1400,
            amenities: ["parking", "lift", "wifi"],
            images: ["https://picsum.photos/seed/rentnest5/800/600"],
        },
        {
            slug: "rented-flat-gulshan",
            categoryId: apartment.id,
            title: "Gulshan Flat (already rented)",
            description: "This one is RENTED — public list-এ আসবে না, filter test করার জন্য।",
            address: "Road 45, Gulshan 2",
            city: "Dhaka",
            area: "Gulshan",
            monthlyRent: 95000,
            securityDeposit: 190000,
            bedrooms: 4,
            bathrooms: 4,
            sizeSqft: 2400,
            amenities: ["parking", "lift", "gym"],
            images: ["https://picsum.photos/seed/rentnest6/800/600"],
            status: "RENTED" as const,
        },
    ];

    for (const property of properties) {
        await prisma.property.upsert({
            where: { slug: property.slug },
            update: {},
            create: { ...property, landlordId: landlord.id },
        });
    }

    console.log("Seed completed");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
