import { redirect } from 'next/navigation';

export default function RootPage() {
  // Gracefully routes incoming traffic from "/" to the actual dashboard "/home"
  redirect('/home');
}