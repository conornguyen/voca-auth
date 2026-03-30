import { createWorkspace } from '../actions/tenant';
import { db } from '../db';
// Mock the core Drizzle connection to isolate business logic testing
jest.mock('../db', () => ({
  db: {
    transaction: jest.fn(),
  },
}));



describe('Subdomain Registration / Workspace Creation', () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a tenant and map the user as Owner', async () => {
    
    // Simulate complex Drizzle transaction callbacks natively handling 'db.transaction'
    const mockDbTransaction = jest.fn().mockImplementation(async (callback) => {
       const mockTx = {
         select: jest.fn().mockReturnThis(),
         from: jest.fn().mockReturnThis(),
         where: jest.fn().mockResolvedValue([]), // No collision detected
         insert: jest.fn().mockReturnThis(),
         values: jest.fn().mockReturnThis(),
         returning: jest.fn()
          .mockResolvedValueOnce([{ id: "tenant_1", slug: "mybiz", name: "My Business" }])
          .mockResolvedValueOnce([{ userId: mockUserId, tenantId: "tenant_1", role: "Owner" }])
       };
       return await callback(mockTx);
    });

    (db.transaction as jest.Mock).mockImplementation(mockDbTransaction);

    // Call the newly implemented GREEN logic
    const result = await createWorkspace(mockUserId, "mybiz", "My Business");
    
    expect(result).toHaveProperty('tenant');
    expect(result.tenant.slug).toBe('mybiz');
    expect(result.role).toBe('Owner');
  });

  it('should fail with a 409 Conflict if the subdomain is already registered', async () => {
    const mockDbTransaction = jest.fn().mockImplementation(async (callback) => {
       const mockTx = {
         select: jest.fn().mockReturnThis(),
         from: jest.fn().mockReturnThis(),
         // Simulating that the database successfully found a collision:
         where: jest.fn().mockResolvedValue([{ id: "tenant_2" }]), 
         insert: jest.fn(),
       };
       return await callback(mockTx);
    });

    (db.transaction as jest.Mock).mockImplementation(mockDbTransaction);

    await expect(createWorkspace(mockUserId, "taken-biz", "Taken Business"))
        .rejects
        .toThrow(/Conflict/); 
  });

  // ─── REFACTOR Phase: Zod Validation Tests ────────────────────────

  it('should reject slugs shorter than 3 characters', async () => {
    await expect(createWorkspace(mockUserId, "ab", "Short Slug"))
        .rejects
        .toThrow();
  });

  it('should reject slugs with uppercase or special characters', async () => {
    await expect(createWorkspace(mockUserId, "My-Biz!", "Bad Slug"))
        .rejects
        .toThrow();
  });

  it('should reject reserved subdomains like admin, api, auth', async () => {
    await expect(createWorkspace(mockUserId, "admin", "Admin Hijack"))
        .rejects
        .toThrow(/reserved/);
  });

  it('should reject an empty workspace name', async () => {
    await expect(createWorkspace(mockUserId, "valid-slug", ""))
        .rejects
        .toThrow();
  });

  it('should reject an invalid userId (non-UUID)', async () => {
    await expect(createWorkspace("not-a-uuid", "valid-slug", "Valid Name"))
        .rejects
        .toThrow();
  });

  // ─── REFACTOR Phase: Transactional Outbox Test ──────────────────────

  it('should safely save a TenantCreated event into the Outbox inside the atomic transaction', async () => {
    const mockInsert = jest.fn().mockReturnThis();
    const mockValues = jest.fn().mockReturnThis();

    const mockDbTransaction = jest.fn().mockImplementation(async (callback) => {
       const mockTx = {
         select: jest.fn().mockReturnThis(),
         from: jest.fn().mockReturnThis(),
         where: jest.fn().mockResolvedValue([]), // No collision detected
         insert: mockInsert,
         values: mockValues,
         returning: jest.fn()
          .mockResolvedValueOnce([{ id: "tenant_sub", slug: "pubsub-biz", name: "PubSub Business" }])
          .mockResolvedValueOnce([{ userId: mockUserId, tenantId: "tenant_sub", role: "Owner" }])
       };
       return await callback(mockTx);
    });

    (db.transaction as jest.Mock).mockImplementation(mockDbTransaction);

    await createWorkspace(mockUserId, "pubsub-biz", "PubSub Business");

    expect(mockInsert).toHaveBeenCalledTimes(3); 
    // 1st insert: tenants. 2nd: tenantUsers. 3rd: outboxEvents

    // Assert the Outbox Event was written
    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
      eventName: 'TenantCreated',
      status: 'pending'
    }));
  });

});
