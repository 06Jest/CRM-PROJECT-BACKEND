import { addLeadToDB } from "../leads.repository";
import { createSupabaseUserClient } from "../../../config/supabase";
import type { AddLead } from "../leads.types";

const mockLead: AddLead = {
  source: "Website",
  first_name: "John",
  last_name: "Doe",
  gender: "Male",
  priority: "Low",
  preferred_contact_time: "Morning",
  email: "john@example.com",
};

jest.mock("../../../config/supabase", () => ({
  createSupabaseUserClient: jest.fn(),
}));

describe("Leads Repository", () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (
      createSupabaseUserClient as jest.Mock
    ).mockReturnValue(mockSupabase);
  });

  describe("addLeadToDB", () => {
    it("should add a lead and return the created lead", async () => {
      const createdLead = {
        id: "lead-123",
        ...mockLead,
        org_id: "org-123",
        owner_id: "member-123",
        updated_by: "member-123",
      };

      const single = jest.fn().mockResolvedValue({
        data: createdLead,
        error: null,
      });

      const select = jest.fn().mockReturnValue({
        single,
      });

      const insert = jest.fn().mockReturnValue({
        select,
      });

      mockSupabase.from.mockReturnValue({
        insert,
      });

      const result = await addLeadToDB(
        "org-123",
        "member-123",
        mockLead as any,
        "access-token"
      );

      expect(createSupabaseUserClient).toHaveBeenCalledWith(
        "access-token"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("leads");

      expect(insert).toHaveBeenCalledWith([
        {
          ...mockLead,
          org_id: "org-123",
          owner_id: "member-123",
          updated_by: "member-123",
        },
      ]);

      expect(result).toEqual(createdLead);
    });

    it("should throw an AppError when adding a lead fails", async () => {
      const single = jest.fn().mockResolvedValue({
        data: null,
        error: {
          message: "Database insert failed",
        },
      });

      const select = jest.fn().mockReturnValue({
        single,
      });

      const insert = jest.fn().mockReturnValue({
        select,
      });

      mockSupabase.from.mockReturnValue({
        insert,
      });

      await expect(
        addLeadToDB(
          "org-123",
          "member-123",
          mockLead,
          "access-token"
        )
      ).rejects.toThrow("Failed to add Lead: Database insert failed");
    });
  });
});