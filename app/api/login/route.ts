import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    const { email, password } = await  req.json();

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if(!user){
        return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if(!user.password) {
        return NextResponse.json({ error: "Invalid Login Credentials" }, { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    return NextResponse.json({ token });

}