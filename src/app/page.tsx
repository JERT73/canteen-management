// File: app/page.tsx

import { redirect } from 'next/navigation';

export default function HomePage() {
  // This component will run on the server when a user visits the root URL ("/").
  // It immediately redirects them to the "/menu" page.
  redirect('/menu');

  // The content below will never be rendered because of the redirect above,
  // but it's good practice to have a return statement.
  return null;
}
