'use client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
export default function Profile(){const {user}=useAuth();return <DashboardLayout><h1 className="text-3xl font-bold">My profile</h1><div className="bg-white border rounded-xl p-6 mt-5"><p>{user?.name}</p><p>{user?.email}</p><p>{user?.role}</p><p>{user?.accountStatus}</p><p className="mt-4">Contact the principal to update your account details.</p></div></DashboardLayout>}
