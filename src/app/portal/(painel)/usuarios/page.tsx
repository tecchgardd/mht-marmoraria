import UsersManager from '@/components/portal/UsersManager';
import { getCurrentUser } from '@/lib/auth/session';
import { listUsers } from '@/lib/auth/users';

export default async function UsersPage() {
  const [users, currentUser] = await Promise.all([listUsers(), getCurrentUser()]);

  return <UsersManager users={users} currentUserId={currentUser?.id || ''} />;
}
