import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminDashboard from '@/components/AdminDashboard';
import TrainerDashboard from '@/components/TrainerDashboard';
import { User } from '@/types';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'TRAINER') {
    // Fetch full user details for the trainer
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { accessibleGroups: true }
    });

    if (!user) {
      // Should not happen if session is valid, but handle gracefully
      return <div>Błąd: Nie znaleziono profilu trenera.</div>;
    }

    // Cast to User type (Prisma type vs App type)
    // We need to ensure the types match or map them
    const appUser: User = {
      id: user.id,
      login: user.login,
      role: user.role as 'TRAINER', // We know it's trainer
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      color: user.color,
      accessLevel: user.accessLevel,
      accessibleGroups: user.accessibleGroups
    };

    return <TrainerDashboard user={appUser} />;
  }

  // Default to Admin Dashboard for ADMIN and others
  return <AdminDashboard />;
}
