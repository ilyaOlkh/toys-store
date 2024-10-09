"use server";

import { getSession } from "@auth0/nextjs-auth0";

export async function getAuth() {
    return await getSession();
}
