import { getSchools, getCountries, getDietaryRestrictions } from "~/server/actions/lookup";
import { RegistrationForm } from "~/components/registration/RegistrationForm";

export default async function RegistrationPage() {
  // Fetch lookup data server-side for instant loading
  const [schools, countries, dietaryRestrictions] = await Promise.all([
    getSchools(),
    getCountries(),
    getDietaryRestrictions(),
  ]);

  return (
    <RegistrationForm
      schools={schools}
      countries={countries}
      dietaryRestrictions={dietaryRestrictions}
    />
  );
}
