import { Db } from "../DbConnectionPool";
import { AuditLog } from "../../Domain/models/AuditLog";
import { AuditLogType } from "../../Domain/enums/AuditLogType";

export async function seedAuditLogs() {
  const repo = Db.getRepository(AuditLog);
  const count = await repo.count();
  if (count > 0) {
    console.log("[Seed] Audit logovi već postoje, preskačem seed.");
    return;
  }

  const logs: Partial<AuditLog>[] = [
    { type: AuditLogType.INFO, description: "Sistem uspješno pokrenut." },
    { type: AuditLogType.INFO, description: "Korisnik admin@osinjel.com se prijavio na sistem." },
    { type: AuditLogType.INFO, description: "Dodana nova biljka: Ruža Damask (Rosa damascena)." },
    { type: AuditLogType.WARNING, description: "Zaliha biljke Lavanda je ispod minimuma (preostalo 2 kg)." },
    { type: AuditLogType.WARNING, description: "Pokušaj pristupa bez autorizacije sa IP 192.168.1.55." },
    { type: AuditLogType.ERROR, description: "Greška pri konekciji na bazu podataka: ETIMEDOUT." },
    { type: AuditLogType.INFO, description: "Kreiran novi parfem: O'Sinjel No. 5 — serija #2024-001." },
    { type: AuditLogType.INFO, description: "Proces destilacije završen za šaržu LAV-2024-003." },
    { type: AuditLogType.WARNING, description: "Temperatura skladišta prekoračila 25°C — zona B3." },
    { type: AuditLogType.ERROR, description: "Neuspješna registracija korisnika: email već postoji." },
  ];

  await repo.save(logs.map((l) => repo.create(l)));
  console.log(`[Seed] Uneseno ${logs.length} audit logova.`);
}
