"use server";

import { db } from "~/server/db";
import { school, country } from "~/server/db/schema";
import { nanoid } from "nanoid";

export async function getSchools() {
  try {
    const schools = await db.query.school.findMany({
      orderBy: (schools, { asc }) => [asc(schools.name)],
    });
    return schools;
  } catch (error) {
    console.error("Get schools error:", error);
    return [];
  }
}

export async function getCountries() {
  try {
    const countries = await db.query.country.findMany({
      orderBy: (countries, { asc }) => [asc(countries.name)],
    });
    return countries;
  } catch (error) {
    console.error("Get countries error:", error);
    return [];
  }
}

// Seed initial data if tables are empty
export async function seedLookupData() {
  try {
    // Check if schools exist
    const existingSchools = await db.query.school.findMany({ limit: 1 });
    if (existingSchools.length === 0) {
      await db.insert(school).values([
        { id: nanoid(), name: "Missouri University of Science and Technology", country: "US" },
        { id: nanoid(), name: "University of Missouri", country: "US" },
        { id: nanoid(), name: "Washington University in St. Louis", country: "US" },
        { id: nanoid(), name: "Saint Louis University", country: "US" },
        { id: nanoid(), name: "University of Missouri-Kansas City", country: "US" },
        { id: nanoid(), name: "Missouri State University", country: "US" },
        { id: nanoid(), name: "Southeast Missouri State University", country: "US" },
        { id: nanoid(), name: "Truman State University", country: "US" },
        { id: nanoid(), name: "Other", country: "US" },
      ]);
    }

    // Check if countries exist
    const existingCountries = await db.query.country.findMany({ limit: 1 });
    if (existingCountries.length === 0) {
      await db.insert(country).values([
        { code: "US", name: "United States" },
        { code: "CA", name: "Canada" },
        { code: "MX", name: "Mexico" },
        { code: "GB", name: "United Kingdom" },
        { code: "IN", name: "India" },
        { code: "CN", name: "China" },
        { code: "DE", name: "Germany" },
        { code: "FR", name: "France" },
        { code: "JP", name: "Japan" },
        { code: "KR", name: "South Korea" },
        { code: "BR", name: "Brazil" },
        { code: "AU", name: "Australia" },
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error("Seed lookup data error:", error);
    return { error: "Failed to seed data" };
  }
}
