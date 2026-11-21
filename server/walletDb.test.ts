import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { debitWalletForOrder, reviewWalletTopup } from "./walletDb";

const request = { id: 4, customerId: 11, methodId: 2, amount: "50.00", reference: "W-11", customerNote: null, status: "pending" as const, adminNote: null, reviewedBy: null, reviewedAt: null, createdAt: new Date(), updatedAt: new Date() };
const wallet = { id: 7, customerId: 11, balance: "100.00", createdAt: new Date(), updatedAt: new Date() };

function rows<T>(value: T[]) { return { from: () => ({ where: () => ({ limit: async () => value }) }) }; }
function transactionDb(selectRows: unknown[][]) {
  const inserted: unknown[] = [];
  const tx = {
    select: vi.fn(() => rows(selectRows.shift() ?? [])),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: async () => [{ affectedRows: 1 }] })) })),
    insert: vi.fn(() => ({ values: (value: unknown) => { inserted.push(value); return { onDuplicateKeyUpdate: async () => undefined }; } })),
  };
  return { tx, inserted, transaction: async (callback: (transaction: typeof tx) => unknown) => callback(tx) };
}

describe("wallet database operations", () => {
  beforeEach(() => vi.resetAllMocks());

  it("credits a wallet once when a pending top-up is approved and records the audit trail", async () => {
    const db = transactionDb([[request], [wallet]]);
    mocks.getDb.mockResolvedValue(db);
    await expect(reviewWalletTopup({ id: 4, adminId: 3, status: "approved", adminNote: "تم التحقق" })).resolves.toEqual({ success: true, customerId: 11 });
    expect(db.tx.update).toHaveBeenCalledTimes(2);
    expect(db.inserted).toContainEqual(expect.objectContaining({ type: "topup", topupRequestId: 4, amount: "50.00", balanceAfter: "150.00" }));
    expect(db.inserted).toContainEqual(expect.objectContaining({ customerId: 11, type: "wallet_topup_approved" }));
  });

  it("rejects a top-up that is no longer pending before changing any balance", async () => {
    const db = transactionDb([[{ ...request, status: "approved" as const }]]);
    mocks.getDb.mockResolvedValue(db);
    await expect(reviewWalletTopup({ id: 4, adminId: 3, status: "approved" })).rejects.toThrow("تمت مراجعة طلب الشحن بالفعل");
    expect(db.tx.update).not.toHaveBeenCalled();
  });

  it("debits only the final order amount and writes a negative purchase transaction", async () => {
    const db = transactionDb([[wallet]]);
    await debitWalletForOrder(db.tx, { customerId: 11, orderId: 99, amount: 25, reference: "GP-TEST" });
    expect(db.inserted).toContainEqual(expect.objectContaining({ type: "purchase", orderId: 99, amount: "-25.00", balanceAfter: "75.00" }));
  });
});
