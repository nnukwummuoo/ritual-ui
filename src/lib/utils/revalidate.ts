'use server';
import { revalidatePath } from "next/cache";

export async function revalidate(route: string) {
    revalidatePath(route, "layout")  
}