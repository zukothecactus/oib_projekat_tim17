import { Db } from "../DbConnectionPool";
import { User } from "../../Domain/models/User";
import { UserRole } from "../../Domain/enums/UserRole";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function seedUsers() {
  const repo = Db.getRepository(User);
  const count = await repo.count();
  if (count > 0) {
    console.log("[Seed@auth] Korisnici već postoje, preskačem seed.");
    return;
  }

  const users: { username: string; email: string; firstName: string; lastName: string; role: UserRole; password: string }[] = [
    {
      username: "admin",
      email: "admin@osinjel.com",
      firstName: "Andrija",
      lastName: "Administrov",
      role: UserRole.ADMIN,
      password: "admin123",
    },
    {
      username: "manager",
      email: "manager@osinjel.com",
      firstName: "Marko",
      lastName: "Menadžer",
      role: UserRole.SALES_MANAGER,
      password: "manager123",
    },
    {
      username: "seller",
      email: "seller@osinjel.com",
      firstName: "Jelena",
      lastName: "Prodavac",
      role: UserRole.SELLER,
      password: "seller123",
    },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, SALT_ROUNDS);
    const entity = repo.create({
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      password: hashed,
      profileImage: null,
    });
    await repo.save(entity);
    console.log(`[Seed@auth] Kreiran korisnik: ${u.username} (${u.role})`);
  }

  console.log(`[Seed@auth] Uneseno ${users.length} korisnika.`);
}
