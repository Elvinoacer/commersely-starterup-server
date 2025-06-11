import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/db";

function generateToken(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "60m" }
  );
  const refreshToken = jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

function setTokens(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === "production";

  const commonOptions = {
    httpOnly: true,
    secure: isProduction, // Always true in production
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict", // Must be "none" for cross-site cookies
    domain: isProduction ? ".onrender.com" : undefined, // Main domain without subdomain
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...commonOptions,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    ...commonOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email exists! Please login.",
      });
      return;
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Notify all SUPER_ADMIN users
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    // Create a notification for each admin
    await prisma.adminNotification.createMany({
      data: admins.map((admin) => ({
        adminId: admin.id,
        type: "NEW_USER_REGISTERED",
        details: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        },
        isRead: false,
      })),
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      userId: user.id,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      error:
        error?.message ||
        "Registration failed, check your details and try again",
      success: false,
    });
  }
};

// Other functions (login, refreshAccessToken, logout) remain unchanged
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const extractCurrentUser = await prisma.user.findUnique({
      where: { email },
      include: { wishlist: true },
    });

    if (
      !extractCurrentUser ||
      !(await bcrypt.compare(password, extractCurrentUser.password))
    ) {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
      return;
    }

    const { accessToken, refreshToken } = generateToken(
      extractCurrentUser.id,
      extractCurrentUser.email,
      extractCurrentUser.role
    );

    // Store refreshToken in the database
    await prisma.user.update({
      where: { id: extractCurrentUser.id },
      data: { refreshToken },
    });

    await setTokens(res, accessToken, refreshToken);
    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        id: extractCurrentUser.id,
        name: extractCurrentUser.name,
        email: extractCurrentUser.email,
        role: extractCurrentUser.role,
        wishlist: extractCurrentUser.wishlist,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { refreshToken: refreshToken },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user.id,
      user.email,
      user.role
    );

    // Update refresh token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    await setTokens(res, accessToken, newRefreshToken);
    res.status(200).json({
      success: true,
      message: "Refresh token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Refresh token error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    httpOnly: true,
  });

  res.clearCookie("refreshToken", {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    httpOnly: true,
  });

  res.json({
    success: true,
    message: "User logged out successfully",
  });
};
