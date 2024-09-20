"use server";
import { updateSession } from "@auth0/nextjs-auth0";

export async function updateUserSession(data) {
    updateSession(data);
}
