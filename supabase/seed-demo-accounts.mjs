// One-time script: creates the two demo accounts (matching the old
// hardcoded DEMO_ADMIN / DEMO_STUDENT credentials) as real Supabase Auth
// users, plus their profile rows. Run with: node supabase/seed-demo-accounts.mjs
// Requires: schema.sql already run, and "Confirm email" turned off in
// Authentication > Sign In / Up (otherwise signUp() won't return a session
// and the profile insert will be skipped).
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8")
    .split(/\r?\n/).filter(Boolean).map((l) => l.split("="))
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function seedAdmin() {
  const { data, error } = await supabase.auth.signUp({ email: "admin@cnhs.edu.ph", password: "admin123" });
  if (error) { console.error("Admin signUp failed:", error.message); return; }
  if (!data.session) {
    console.error("No session after signUp — 'Confirm email' is probably still ON. Turn it off in Authentication > Sign In / Up, then re-run this script.");
    return;
  }
  const { error: insertError } = await supabase.from("admins").insert({ id: data.user.id, email: "admin@cnhs.edu.ph", name: "Administrator" });
  if (insertError) console.error("Admin profile insert failed:", insertError.message);
  else console.log("Admin account ready:", data.user.id);
  await supabase.auth.signOut();
}

async function seedStudent() {
  const { data, error } = await supabase.auth.signUp({ email: "student@cnhs.edu.ph", password: "student123" });
  if (error) { console.error("Student signUp failed:", error.message); return; }
  if (!data.session) {
    console.error("No session after signUp — 'Confirm email' is probably still ON. Turn it off in Authentication > Sign In / Up, then re-run this script.");
    return;
  }
  const { error: insertError } = await supabase.from("students").insert({
    id: data.user.id, name: "Sample Student", email: "student@cnhs.edu.ph",
    age: 14, sex: "", grade: "Grade 8", section: "Rizal", approved: true,
  });
  if (insertError) console.error("Student profile insert failed:", insertError.message);
  else console.log("Student account ready:", data.user.id);
  await supabase.auth.signOut();
}

await seedAdmin();
await seedStudent();
