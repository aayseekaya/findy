import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Chat from "@/app/components/Chat"
import prisma from "@/lib/prisma"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    select: { name: true }
  })

  if (!business) {
    redirect("/")
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-4">
        {business.name} ile Sohbet
      </h1>
      <Chat businessId={params.id} />
    </div>
  )
} 