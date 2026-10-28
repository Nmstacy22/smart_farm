"use client";

import { useState } from "react";
import UserCard, { type Role } from "../../components/users/UserCard";
import StatCard from "../../components/ui/StatCard";
import { Users } from "lucide-react";

const SAMPLE_USERS: { id: string; name: string; role: Role; phone: string }[] = [
  { id: "u1", name: "Ama Johnson", role: "owner", phone: "+23765000001" },
  { id: "u2", name: "Samuel N.", role: "manager", phone: "+23765000002" },
  { id: "u3", name: "Aisha T.", role: "worker", phone: "+23765000003" },
  { id: "u4", name: "Pierre K.", role: "worker", phone: "+23765000004" },
];

export default function UsersPage() {
  const [users, setUsers] = useState(SAMPLE_USERS);

  function changeRole(id: string, role: Role) {
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
  }

  return (
    <div className="min-h-screen w-full bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">Users & Roles</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage user roles and contact details.</p>
          </div>
          <div className="hidden gap-3 sm:flex">
            <StatCard title="Users" value={users.length} icon={Users} />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3">
          {users.map((u) => (
            <UserCard key={u.id} user={u} onChangeRole={changeRole} />
          ))}
        </div>
      </div>
    </div>
  );
}
