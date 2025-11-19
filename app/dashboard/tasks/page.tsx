import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function EditTaskPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/signin");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Edit Instruction</h1>
                <p className="text-muted-foreground">
                    Edit functionality coming soon. For now, please delete and recreate the instruction.
                </p>
            </div>
        </div>
    );
}
